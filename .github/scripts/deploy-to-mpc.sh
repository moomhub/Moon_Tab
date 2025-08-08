#!/bin/bash

# 部署到Microsoft Partner Center的脚本
# 包含上传、状态检查、发布和发布状态检查的完整流程

set -e  # 遇到错误时终止脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
echo_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必需的环境变量
check_env_vars() {
  echo_info "校验环境变量..."
  local missing=()
  for var in MPC_CLIENT_ID MPC_API_KEY MPC_PRODUCT_ID MPC_API_BASE; do
    if [ -z "${!var}" ]; then 
      missing+=($var)
    fi
  done
  
  if [ ${#missing[@]} -gt 0 ]; then
    echo_error "缺少环境变量: ${missing[*]}"
    exit 1
  fi
  
  echo_info "所有必需的环境变量均已设置"
}

# 上传包到MPC
upload_package() {
  echo_info "开始上传包到Microsoft Partner Center..."
  
  if [ ! -f "dist.zip" ]; then
    echo_error "找不到 dist.zip 文件!"
    exit 1
  fi
  
  local size=$(stat -c%s dist.zip)
  if [ "$size" -eq 0 ]; then
    echo_error "dist.zip 文件为空!"
    exit 1
  fi
  
  echo_info "dist.zip 大小: $size 字节"
  
  local response=$(curl -s -w "%{http_code}" \
    -H "Authorization: ApiKey $MPC_API_KEY" \
    -H "X-ClientID: $MPC_CLIENT_ID" \
    -H "Content-Type: application/zip" \
    -X POST \
    --data-binary "@dist.zip" \
    "$MPC_API_BASE/products/$MPC_PRODUCT_ID/submissions/draft/package")
  
  # 提取响应体和状态码
  local body=$(echo "$response" | head -c -4)
  local status_code=$(echo "$response" | tail -c 4)
  
  echo "响应: $body"
  echo "状态码: $status_code"
  
  if [ "$status_code" != "202" ]; then
    echo_error "上传失败，状态码: $status_code"
    exit 1
  fi
  
  # 从响应头中提取Operation ID
  UPLOAD_OPERATION_ID=$(echo "$body" | grep -i "location" | sed -E 's/.*\/operations\/([a-zA-Z0-9-]+).*/\1/')
  echo_info "上传操作ID: $UPLOAD_OPERATION_ID"
  echo_info "包上传成功"
}

# 检查上传状态
check_upload_status() {
  echo_info "检查上传状态，操作ID: $UPLOAD_OPERATION_ID"
  
  # 轮询检查状态，最多尝试10次，每次间隔10秒
  for i in {1..10}; do
    echo_info "尝试 $i/10"
    
    local response=$(curl -s -w "%{http_code}" \
      -H "Authorization: ApiKey $MPC_API_KEY" \
      -H "X-ClientID: $MPC_CLIENT_ID" \
      -X GET \
      "$MPC_API_BASE/products/$MPC_PRODUCT_ID/submissions/draft/package/operations/$UPLOAD_OPERATION_ID")
    
    # 提取响应体和状态码
    local body=$(echo "$response" | head -c -4)
    local status_code=$(echo "$response" | tail -c 4)
    
    echo "响应: $body"
    echo "状态码: $status_code"
    
    if [ "$status_code" != "200" ]; then
      echo_error "状态检查失败，状态码: $status_code"
      exit 1
    fi
    
    # 解析状态
    local status=$(echo "$body" | grep -o '"status":[^,}]*' | sed 's/"status"://g' | sed 's/"//g')
    echo_info "上传状态: $status"
    
    if [ "$status" == "Succeeded" ]; then
      echo_info "包上传完成"
      return 0
    elif [ "$status" == "Failed" ]; then
      echo_error "包上传失败"
      exit 1
    elif [ $i -eq 10 ]; then
      echo_error "包上传超时"
      exit 1
    else
      echo_warn "包上传进行中，等待10秒..."
      sleep 10
    fi
  done
}

# 发布提交
publish_submission() {
  echo_info "开始发布提交..."
  
  local response=$(curl -s -w "%{http_code}" \
    -H "Authorization: ApiKey $MPC_API_KEY" \
    -H "X-ClientID: $MPC_CLIENT_ID" \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{"notes":"Updated via GitHub Actions"}' \
    "$MPC_API_BASE/products/$MPC_PRODUCT_ID/submissions")
  
  # 提取响应体和状态码
  local body=$(echo "$response" | head -c -4)
  local status_code=$(echo "$response" | tail -c 4)
  
  echo "响应: $body"
  echo "状态码: $status_code"
  
  if [ "$status_code" != "202" ]; then
    echo_error "发布失败，状态码: $status_code"
    exit 1
  fi
  
  # 从响应头中提取Operation ID
  PUBLISH_OPERATION_ID=$(echo "$body" | grep -i "location" | sed -E 's/.*\/operations\/([a-zA-Z0-9-]+).*/\1/')
  echo_info "发布操作ID: $PUBLISH_OPERATION_ID"
  echo_info "提交发布成功"
}

# 检查发布状态
check_publish_status() {
  echo_info "检查发布状态，操作ID: $PUBLISH_OPERATION_ID"
  
  # 轮询检查状态，最多尝试15次，每次间隔20秒
  for i in {1..15}; do
    echo_info "尝试 $i/15"
    
    local response=$(curl -s -w "%{http_code}" \
      -H "Authorization: ApiKey $MPC_API_KEY" \
      -H "X-ClientID: $MPC_CLIENT_ID" \
      -X GET \
      "$MPC_API_BASE/products/$MPC_PRODUCT_ID/submissions/operations/$PUBLISH_OPERATION_ID")
    
    # 提取响应体和状态码
    local body=$(echo "$response" | head -c -4)
    local status_code=$(echo "$response" | tail -c 4)
    
    echo "响应: $body"
    echo "状态码: $status_code"
    
    if [ "$status_code" != "200" ]; then
      echo_error "状态检查失败，状态码: $status_code"
      exit 1
    fi
    
    # 解析状态
    local status=$(echo "$body" | grep -o '"status":[^,}]*' | sed 's/"status"://g' | sed 's/"//g')
    echo_info "发布状态: $status"
    
    if [ "$status" == "Succeeded" ]; then
      echo_info "扩展发布成功!"
      return 0
    elif [ "$status" == "Failed" ]; then
      echo_error "扩展发布失败"
      exit 1
    elif [ $i -eq 15 ]; then
      echo_error "扩展发布超时"
      exit 1
    else
      echo_warn "扩展发布进行中，等待20秒..."
      sleep 20
    fi
  done
}

# 主函数
main() {
  echo_info "开始部署到Microsoft Partner Center"
  
  # 检查环境变量
  check_env_vars
  
  # 上传包
  upload_package
  
  # 检查上传状态
  check_upload_status
  
  # 发布提交
  publish_submission
  
  # 检查发布状态
  check_publish_status
  
  echo_info "部署完成!"
}

# 执行主函数
main
#!/bin/bash
set -e

# ====== 配置区域 ======
API_ENDPOINT="https://api.addons.microsoftedge.microsoft.com"
CLIENT_ID=$MPC_CLIENT_ID
API_KEY=$MPC_API_KEY
PRODUCT_ID=$MPC_PRODUCT_ID
FILE_PATH="dist.zip"
PUBLISH_NOTES="自动化发布测试"
RETRY_LIMIT=10
RETRY_INTERVAL=5   # 秒
# =====================

# 日志函数
log_info() { echo -e "\033[1;32m[INFO] $(date '+%Y-%m-%d %H:%M:%S')\033[0m $1"; }
log_error() { echo -e "\033[1;31m[ERROR] $(date '+%Y-%m-%d %H:%M:%S')\033[0m $1"; }

# 从响应头提取 Location (operationID)
extract_operation_id() {
    grep -i "location:" | awk '{print $2}' | tr -d '\r\n '
}

# 检查 curl 命令是否成功执行
curl_check() {
    if [ $? -ne 0 ]; then
        log_error "curl 命令执行失败"
        exit 1
    fi
}

# 检查状态，返回 status 值（不混日志）
check_status() {
    local url="$1"
    local status=""
    local count=0
    while [[ $count -lt $RETRY_LIMIT ]]; do
        local resp=$(curl -s \
            -H "Authorization: ApiKey $API_KEY" \
            -H "X-ClientID: $CLIENT_ID" \
            "$url")
        curl_check
        status=$(echo "$resp" | jq -r '.status')
        # 把日志输出到 stderr，这样不会进入变量
        log_info "当前状态: $status" >&2
        if [[ "$status" != "InProgress" ]]; then
            if [[ "$status" == "Failed" ]]; then
                local msg=$(echo "$resp" | jq -r '.message')
                local errs=$(echo "$resp" | jq -r '.errors | join("; ")')
                log_error "失败原因: $msg" >&2
                [[ "$errs" != "null" && -n "$errs" ]] && log_error "错误详情: $errs" >&2
                log_error "完整响应: $resp" >&2
            fi
            break
        fi
        ((count++))
        log_info "等待 $RETRY_INTERVAL 秒后重试..." >&2
        sleep $RETRY_INTERVAL
    done
    printf "%s" "$status"
}


# 1. 上传扩展包
log_info "开始上传扩展包..."
UPLOAD_RESPONSE=$(curl -s -D - \
  -H "Authorization: ApiKey $API_KEY" \
  -H "X-ClientID: $CLIENT_ID" \
  -H "Content-Type: application/zip" \
  -X POST \
  --data-binary @"$FILE_PATH" \
  "$API_ENDPOINT/v1/products/$PRODUCT_ID/submissions/draft/package")
curl_check

UPLOAD_LOCATION=$(echo "$UPLOAD_RESPONSE" | extract_operation_id)
if [[ -z "$UPLOAD_LOCATION" ]]; then
    log_error "上传失败，未获取到 operationID"
    log_error "响应内容: $UPLOAD_RESPONSE"
    exit 1
fi
UPLOAD_OP_ID=$(basename "$UPLOAD_LOCATION")
log_info "上传已提交，operationID: $UPLOAD_OP_ID"

# 2. 检查上传状态
UPLOAD_STATUS=$(check_status "$API_ENDPOINT/v1/products/$PRODUCT_ID/submissions/draft/package/operations/$UPLOAD_OP_ID")
if [[ "$UPLOAD_STATUS" != "Succeeded" ]]; then
    log_error "上传失败或超时，最终状态: $UPLOAD_STATUS"
    exit 1
fi
log_info "包上传成功！"

# 3. 提交发布
log_info "开始提交发布..."
PUBLISH_RESPONSE=$(curl -s -D - \
  -H "Authorization: ApiKey $API_KEY" \
  -H "X-ClientID: $CLIENT_ID" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "{\"notes\":\"$PUBLISH_NOTES\"}" \
  "$API_ENDPOINT/v1/products/$PRODUCT_ID/submissions")
curl_check

PUBLISH_LOCATION=$(echo "$PUBLISH_RESPONSE" | extract_operation_id)
if [[ -z "$PUBLISH_LOCATION" ]]; then
    log_error "发布提交失败，未获取到 operationID"
    log_error "响应内容: $PUBLISH_RESPONSE"
    exit 1
fi
PUBLISH_OP_ID=$(basename "$PUBLISH_LOCATION")
log_info "发布已提交，operationID: $PUBLISH_OP_ID"

# 4. 检查发布状态
PUBLISH_STATUS=$(check_status "$API_ENDPOINT/v1/products/$PRODUCT_ID/submissions/operations/$PUBLISH_OP_ID")
if [[ "$PUBLISH_STATUS" != "Succeeded" ]]; then
    log_error "发布失败或超时，最终状态: $PUBLISH_STATUS"
    exit 1
fi
log_info "扩展已成功发布！"
interface Author {
    id: string;
    nickname: string | null;
    avatar: string;
    gender: string;
    isAdmin: boolean;
    isVip: boolean;
}

interface IconData {
    id: string;
    title: string;
    url: string;
    icon: string;
    keywords: null;
    description: null;
    author: Author;
    categories: any[];
    background: null;
    shadow: string;
    svg: null;
    svg2: null;
}

// 图标上传接口返回数据
export interface IconUploadResultData {
    data: IconData;
    code: number;
    success: boolean;
}



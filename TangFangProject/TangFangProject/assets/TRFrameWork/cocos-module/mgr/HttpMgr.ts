import Singleton from "../../UIFrame/Singleton";

export interface HttpOptions {
    httpType: HttpType,
    url: string,
    headers: Array<{ key: string, value: string }>,
    body: {},
    success: (response: any) => void,
    fail: () => void
}
//leyo-appid：fa7e897d79

export enum HttpType {
    Get = "GET",
    Post = "POST",
}

/** 网络请求参数 */
export interface requestParam {
    url: string; // 请求链接【必须】
    method: HttpType; // 请求类型【默认 GET】
    data?; // 请求数据【POST时才有效】
    timeout?: number; // 超时时间【默认5000毫秒】
    contentType?; // 请求协议头 [['Content-type', application/x-www-form-urlencoded]]
    dataType?; // 返回数据类型【默认text】【arraybuffer blob document json text】
    success?: Function; // 成功时回调
    error?: Function; // 失败时回调
    context?; // 上下文环境
}


export default class HttpMgr extends Singleton<HttpMgr> {

    request(options: HttpOptions) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                console.log("HTTP response: " + response + options.url);
                options.success(xhr.response);
            }
            else {
                options.fail();
            }
        };


        xhr.open(options.httpType, options.url, true);//true为异步请求
        options.headers.forEach(element => {
            xhr.setRequestHeader(element.key, element.value);
        });
        const body_params = options.httpType == HttpType.Get ? null : JSON.stringify(options.body);
        xhr.send(body_params);
    }


    /**
       * 封装原生的XMLHttpRequest
       * 使其用法像ajax
       *
       * url          请求链接【必须】
       * method       请求类型【默认 GET】
       * data         请求数据
       * timeout      超时时间【默认5000毫秒】
       * contentType  请求协议头 [['Content-type', application/x-www-form-urlencoded]]
       * dataType     返回数据类型【默认text】【arraybuffer blob document json text】
       * success      成功时回调
       * error        失败时回调
       * context      上下文环境
       */
    sendReq(params: requestParam) {
        // 必要参数判断
        if (!params) {
            cc.error('http请求参数为空');
            return;
        }
        if (!params.url) {
            cc.error('http请求url为空');
            return;
        }

        // 默认参数补齐
        // success error context 不设置默认
        params.method = (params.method || HttpType.Get)
        params.data = params.data || {};
        params.timeout = params.timeout || 5000;
        params.contentType = params.contentType || [];
        params.dataType = params.dataType || '';

        // 对XHMHttp对象进行设置
        let xhr = new XMLHttpRequest();
        xhr.timeout = params.timeout;
        xhr.onload = e => {
            // 非200的都认为是失败
            // 假如服务器返回数据不规范，用了非200作为成功标志，这里会出现判断异常
            if (xhr.status == 200) {
                if (params.success) {
                    if (params.context) {
                        params.success.call(params.context, xhr.response);
                    } else {
                        params.success(xhr.response);
                    }
                }
            } else {
                if (params.error) {
                    if (params.context) {
                        params.error.call(
                            params.context,
                            'status:' + xhr.status
                        );
                    } else {
                        params.error('status:' + xhr.status);
                    }
                }
            }
        };
        xhr.ontimeout = e => {
            if (params.error) {
                if (params.context) {
                    params.error.call(params.context, e);
                } else {
                    params.error(e);
                }
            }
        };
        xhr.onerror = e => {
            if (params.error) {
                if (params.context) {
                    params.error.call(params.context, e);
                } else {
                    params.error(e);
                }
            }
        };
        xhr.onabort = e => {
            if (params.error) {
                if (params.context) {
                    params.error.call(params.context, e);
                } else {
                    params.error(e);
                }
            }
        };


        if (params.method == HttpType.Get) {
            let str = "?"
            let num = 0;
            for (let i in params.data) {
                if (num != 0) str += "&"
                str += `${i}=${params.data[i] + ''}`
                num++;
            }
            params.url += str
        }
        // console.log("params.url", params.url)

        xhr.open(params.method, params.url, true);
        for (let i = 0; i < params.contentType.length; i += 2) {
            (params.contentType.length >= i + 1) && xhr.setRequestHeader(params.contentType[i], params.contentType[i + 1]);
        }
        xhr.responseType = params.dataType;
        if (params.method == HttpType.Post) {
            xhr.send(params.data);
        } else {
            xhr.send();
        }
    }
}
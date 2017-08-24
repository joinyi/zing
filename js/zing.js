(function() {
    var zing = window.zing || {}
    zing = new (function() {
        var t = this;
        /*
        obj
        @method 请求方法
        @uri 请求地址
        @data 请求数据
        @token 请求令牌
        @success 成功回调函数
        @fail 失败回调
        */
        t.request = function(obj) {
            var success = obj.success || null,
            fail = obj.fail || null,
            data = obj.data || null,
            token = obj.token || null,
            uri = obj.uri || null,
            method = obj.method || null,
            type = obj.type || null;
            if (!method || !uri || !method) { return }
            var xmlHttpRequest = new XMLHttpRequest(),
                sign = token == undefined;
            data = (method !== 'GET' && method !== 'get') ? JSON.stringify(data) : null,
            xmlHttpRequest.open(method, uri, true);
            xmlHttpRequest.onreadystatechange = function() {
                if (xmlHttpRequest.readyState == 4){
                    var datas = JSON.parse(xmlHttpRequest.responseText);
                    if (datas) {
                        success && success(datas)
                    }
                }
            }
            // 定义发生错误时执行的操作
            xmlHttpRequest.addEventListener('error', function(event) {
                fail && fail()
            });
            if (!type) {
                xmlHttpRequest.setRequestHeader('Content-Type', 'application/json')
                xmlHttpRequest.setRequestHeader('Accept', 'application/json')
            }
            if (!sign) {
                xmlHttpRequest.setRequestHeader('Authorization', ('Bearer ' + token))
            }
            if (type) {
                var urlEncodedData = ''
                for(name in obj.data) {
                    urlEncodedData += name + "=" + obj.data[name] + "&";
                }
                urlEncodedData = urlEncodedData.slice(0, -1)
                urlEncodedData = encodeURIComponent(urlEncodedData)
                urlEncodedData = urlEncodedData.replace(/%26/g,'&').replace(/%3D/g,'=')
                data = urlEncodedData
                xmlHttpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
            }
            xmlHttpRequest.send(data);    
        }
        
        t.dom = function(style, str, doc) {
            var doc = doc || document;
            if(style == 'id')
                return doc.getElementById(str)
            else if(style == 'class')
                return doc.getElementsByClassName(str) ? doc.getElementsByClassName(str)[0] : null
            else if(style == 'tag')
                return doc.getElementsByTagName(str)
            return null
        }

        t.tips = function(el, tips) {
            el.innerText = tips
            setTimeout(function() {
                el.innerText = ''
            }, 1800)
        }
        t.loading = function(type) {
            if (type === 'close') {
                var _loading = t.dom('class', 'd-circle')
                _loading && (_loading.remove())
                return
            }
            var _doms = {} , _eles = ['svg', 'circle'], _atrrs = { cx: 15, cy: 15, r: 14, fill: 'none', 'class': 'd-circle_path' };
            _doms.loading = t.dom('class', 'd-loading')
            _doms.div = document.createElement('div')
            _eles.forEach(item => {
               _doms[item] = document.createElementNS('http://www.w3.org/2000/svg', item)
               if (item === 'circle') {
                   for (var key in _atrrs) {
                       _doms[item].setAttribute(key, _atrrs[key])
                       _doms['svg'].appendChild(_doms[item])
                   }
               }
               if (item === 'svg') {
                    _doms[item].setAttribute('class', 'd-circle_round')
                    _doms[item].setAttributeNS('http://www.w3.org/1999/xlink', 'viewBox', '25 25 50 50')
                    _doms['div'].appendChild(_doms[item])
               }
            })
            _doms.div.className = 'd-circle'
            _doms.loading.appendChild(_doms.div)
        }
        t.click = function(el, fn) {
            if (el.addEventListener) {
                el.addEventListener('click', fn, false)
                return true
            }
            return false
        }
        t.date = function(date, t) {
            function completion(data) {
                return (data < 10 ? ('0' + data) : data) || '未知'
            }
            t = t || 0
            date = date ? new Date(date).getTime() : Date.now()
            const now = date + t * 86400000
            const newTime = new Date(now)
            const month = newTime.getMonth() + 1
            const day = newTime.getDate()
            return (newTime.getFullYear() || '未知') + '-' + completion(month) + '-' + completion(day)
        }
        t.display = function(el, type) {
            type = type || 'block'
            el.style.display = type
        }
    });
    window.zing = zing
})();

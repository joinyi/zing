(function() {
    var $ = zing.dom
    function login() {
        var body = {
            action: $('id', 'account').value.replace(/^\s+|\s+$/g, ''),
            password: $('id', 'password').value.replace(/^\s+|\s+$/g, '')
        }
        var _tips = $('id', 'tips')
        if (!checkAccount(_tips, body)) return
        zing.request({
            method: 'post',
            uri: 'https://api.zhiyoula.com/v2/account/signin/email',
            data: body,
            success: function(res) {
                var _login = { token: res.result.token, time: Date.now() }
                chrome.storage.sync.set(_login, function() {
                    start()
                });
            }
        })
    }
    function checkAccount(el, obj) {
        for (var key in obj) {
            if (!obj[key]) {
                zing.tips(el, '请填写完整信息～')
                return false
            }
        }
        return true
    }

    function eventInit(port) {
        zing.click($('class', 'popup-header_left'), function() {
            dateChange(-1)
        })
        zing.click($('class', 'popup-header_right'), function() {
            dateChange(1)
        })
        zing.click($('class', 'popup-footer_btn'), function() {
            chrome.storage.sync.get('list', function(data) {
                console.log(data)
                if (!data.list || !data.list.length) return
                data.list.forEach(item => {
                    if (item.stock) return
                    toStock(item)
                })
            })
        })
        function dateChange(date) {
            var _date = zing.date($('class', 'popup-header_date').innerText, date)
            var _time = new Date(_date.replace(/-/g, '/')).getTime()
            port.postMessage({
                popup: 'update',
                date: {
                    start: _time,
                    end: _time + 86400000
                }
            })
            zing.loading()
            $('class', 'popup-header_date').innerText = _date
        }
    }
    function getOrderList(obj) {
        zing.request({
            method: 'get',
            uri: 'https://api.zhiyoula.com/v2/goods?peers=3&filter=0&start=' + obj.start + '&end=' + obj.end,
            token: obj.token,
            success: function(res) {
                console.log(res, 2000)
                $('class', 'popup-header_date').innerText = obj.start
                renderOrderList(res.result)
            }
        })
    }
    function toStock(data) {
        zing.request({
            method: 'POST',
            token: zing.token,
            uri: 'https://api.zhiyoula.com/v2/booking/common',
            data: data,
            success: function(res) {
                if (res.result !== undefined) {
                    $('id', data.action).innerText = '已入库'
                    $('id', data.action).style.backgroundColor = '#999'
                }
            }
        })
    }
    function message(port) {
        port.onMessage.addListener(function(msg) {
            if (msg.content === 'start') {
                renderOrderList(msg.list)
                checkOrders(msg.list)
            }
            else if (msg.content === 'update') {
                renderOrderList(msg.list)
                checkOrders(msg.list)
            }
        })
    }
    function renderOrderList(orders) {
        zing.loading('close')
        if (!orders || !orders.length) {
            $('class', 'popup-content').innerHTML = '<p class="popup-content_indit">该日期没有入库任何订单～</p>'
            return
        }
        var _html = ''
        orders.forEach(item => {
            _html += '<div class="popup-content_item"><div><span>订单信息 ：</span><content class="popup-content_item__name"><i>'+
            item.title + '</i><b></b></content></div><div><span>订单编号 ：</span><content>'+
            item.action + '</content></div><div><span>客人姓名 ：</span><content>' +
            (item.name || '无') + '</content></div><div><span>订单金额 ：</span><content>' +
            item.price + '</content></div><div><span>产品编号 ：</span><content>' +
            item.product + '</content></div><div><span>下单时间 ：</span><content>' +
            item.time + '</content></div><div><span>出行日期 ：</span><content>' +
            item.departure + '</content></div><i class="popup-content_item__indit" id = "' +
            item.action + '">已入库</i></div>'
        })
        $('class', 'popup-content').innerHTML = _html
    }
    function checkOrders(orders) {
        const _list = []
        function check(item, index, res) {
            console.log(res)
            if (res && res.status === 404) {
                $('id', item.action).innerText = '未入库'
                $('id', item.action).style.backgroundColor = '#ff8a34'
                item.stock = false
            }
            _list.push(item)
            if (index === (orders.length - 1)) {
                chrome.storage.sync.set({list: _list}, function() {
                    console.log('storage updateing...')
                })
            }
        }
        orders.forEach((item, index) => {
            zing.request({
                method: 'get',
                token: zing.token,
                uri: 'https://api.zhiyoula.com/v2/booking/verify/' + item.action,
                success: function(res) {
                    check(item, index, res)
                },
                fail: function() {
                    check(item, index)
                }
            })
        })
    }
    function setTitle(date) {
        $('class', 'popup-header_date').innerText = date
    }
    function checkToken(data) {
        if (!data.time) return false
        //518400000
        if (Date.now() - data.time > 518400000) { return true }
        return false
    }
    function start() {
        chrome.storage.sync.get(null, function(data) {
            if (!data || !data['token'] || checkToken(data)) {
                zing.click($('id', 'login'), login)
                return
            }
            chrome.tabs.query({ active: true }, function(tab) {
                var port = chrome.tabs.connect(tab[0].id, {name: "stock"})
                port.postMessage({
                    popup: 'start',
                    date: {
                        start: new Date(zing.date().replace(/-/g, '/')).getTime(),
                        end: Date.now()
                    }
                })
                eventInit(port)
                message(port)
                zing.loading()
            })
            zing.token = data['token']
            zing.display($('class', 'popup-login'), 'none')
            zing.display($('class', 'popup-list'))
            setTitle(zing.date())
        })
    }
    function init() {
        document.addEventListener('DOMContentLoaded', function() {
            start()
        })
    }
    init()
})()
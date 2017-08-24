(function() {
    function getOrderList(date, callback) {
        var body = {
            auctionType: 0,
            close: 0,
            pageNum: 1,
            pageSize: 15,
            queryMore: false,
            rxAuditFlag: 0,
            rxHasSendFlag: 0,
            rxOldFlag: 0,
            rxSendFlag: 0,
            rxSuccessflag: 0,
            tradeTag: 0,
            useCheckcode: false,
            useOrderInfo: false,
            errorCheckcode: false,
            action: 'itemlist/SoldQueryAction',
            dateBegin: date.start,
            dateEnd: date.end,
            prePageNo: 1
        }
        var orderList = []
        function _getOrder() {
            zing.request({
                method: 'post',
                uri: 'https://trade.taobao.com/trade/itemlist/asyncSold.htm?event_submit_do_query=1&_input_charset=utf8',
                data: body,
                type: 'formData',
                success: function(res) {
                    if (res.query.pageSize === res.mainOrders.length) {
                        body.pageNum += 1
                        orderList = orderList.concat(res.mainOrders)
                        _getOrder()
                    }
                    if (res.extra.queryTitleMaxSize > res.mainOrders.length) {
                        orderList = orderList.concat(res.mainOrders)
                        callback(orderList)
                        return
                    }
                }
            })
        }
        _getOrder()
    }
    function getOrderData(orders, callback) {
        var _index = 0, _list = [];
        if (!orders || !orders.length) {
            callback && callback([])
            return
        }
        var getName = function() {
            zing.request({
                method: 'POST',
                uri: 'https://trade.taobao.com/trade/json/getMessage.htm?biz_order_id=' + orders[_index].orderInfo.id + '&archive=false',
                success: function(res) {
                    if (!res) return
                    const _item = orderToStock(orders[_index], res.tip)
                    _item && (_list.push(_item))
                    if (_index < (orders.length - 1)) {
                        _index++
                        getName()
                    }
                    if (_index >= (orders.length - 1)) {
                        callback && callback(_list)
                        return
                    }
                }
            })
        }
        getName()
    }
    function orderToStock(item, infoText) {
        var name = /(联系人\S+)/.exec(infoText) ? /(联系人\S+)/.exec(infoText)[0].replace('联系人：', '') : null
        var phone = /(电话\S+)/.exec(infoText) ? /(电话\S+)/.exec(infoText)[0].replace('电话：', '') : null
        var departure = /(出行日期\S+)/.exec(infoText) ? /(出行日期\S+)/.exec(infoText)[0].replace('出行日期：', '') : null
        var product = (item.subOrders[0].itemInfo && item.subOrders[0].itemInfo.extra) ? item.subOrders[0].itemInfo.extra[0].value : null
        if (item.extra.sellerFlag != 1) return null
        if (!name || !product) return null
        return body = {
            stock: true,
            action: item.orderInfo.id,
            amount: item.subOrders[0].quantity - 0,
            departure: departure,
            name: name,
            peers: 3,
            phone: phone - 0,
            time: item.orderInfo.createTime,
            price: item.payInfo.actualFee - 0,
            title: item.subOrders[0].itemInfo.title,
            product: product - 0
        }
    }
    function start() {
        chrome.runtime.onConnect.addListener(function(port) {
            console.assert(port.name == "stock")
            port.onMessage.addListener(function(msg) {
                if (msg.popup === 'start') {
                    getOrderList(msg.date, function(orders) {
                        getOrderData(orders, function(list) {
                            port.postMessage({content: 'start', list: list})
                        })
                    })
                }
                else if (msg.popup === 'update') {
                    getOrderList(msg.date, function(orders) {
                        getOrderData(orders, function(list) {
                            port.postMessage({content: 'update', list: list})
                        })
                    })
                }
            })
        })
    }
    start()
})()
console.log('start.....')

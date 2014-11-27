/**
* cron.js components/cron.js
*
* MIT LICENSE
*
* Copyright (c) 2014 PT Sagara Xinix Solusitama - Xinix Technology
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* @author Farid Hidayat <e.faridhidayat@gmail.com>
* @copyright 2014 PT Sagara Xinix Solusitama
*/

var Channel,
    Exchange,
    later = require('later');

module.exports = function(yesbee) {

    Exchange = yesbee.Exchange;
    Channel = yesbee.Channel;

    this.schedule = null;
    this.start = function() {

        if(!this.options.expression) {
            throw new Error('Cron need one expression.');
        }

        var cron = this.options.expression,
            s = later.parse.cron(cron),
            timeSched = later.schedule(s).next(),
            now = new Date().getTime(),
            that = this,
            fn = function() {
                var exchange = new Exchange();
                that.context.send(Channel.IN, that, exchange, that);
            };

        // console.log(timeSched);
        that.schedule = setTimeout(fn, (timeSched.getTime() - now));
        // that.schedule = setTimeout(fn, 3000 );
        this.constructor.prototype.start.apply(this, arguments);

    };

    // clear timeout
    this.stop = function() {
        this.constructor.prototype.stop.apply(this, arguments);
        clearTimeout(this.schedule);
        console.log('stopped');
    };

};
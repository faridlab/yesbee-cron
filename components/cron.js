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
    "use strict";

    Exchange = yesbee.Exchange;
    Channel = yesbee.Channel;

    this.timer = null;
    this.method = 'interval';
    this.expression = '';

    this.start = function() {
        if(!this.options.cron && !this.options.text && !this.options.interval) {
            throw new Error('Need an cron, text, or interval expression');
        }

        if (this.options.interval) {
            this.expression = this.options.interval;

            var fnInterval = function() {
                var exchange = new Exchange();
                // TODO: uncomment these line below, when yesbee new version is already to use
                // this.LOG.info('Trigger interval %s', new Date() + '');
                this.context.send(Channel.IN, this, exchange, this);

                this.timer = setTimeout(fnInterval, this.expression);
            }.bind(this);

            if (this.options.immediate) {
                fnInterval();
            } else {
                this.timer = setTimeout(fnInterval, this.expression);
            }

        } else {
            this.method = this.options.cron ? 'cron' : 'text';
            this.expression = this.options.cron || this.options.text;

            var s = later.parse[this.method](this.expression),
                schedule = later.schedule(s),
                fn = function() {
                    var exchange = new Exchange();
                    // TODO: uncomment these line below, when yesbee new version is already to use
                    // this.LOG.info('Trigger next cron will be at %s', schedule.next() + '');
                    this.context.send(Channel.IN, this, exchange, this);
                }.bind(this);

            if (!schedule.isValid()) {
                throw new Error('Expression is not valid [' + this.method + ':' + this.expression + ']');
            }

            var message = 'Cron scheduled to run at:';
            schedule.next(5).forEach(function(t) {
                message += '\n  ' + t;

            });

            // TODO: uncomment these line below, when yesbee new version is already to use
            // this.LOG.info(message);

            if (this.options.immediate) {
                fn();
            }
            this.timer = later.setInterval(fn, s);
        }

        this.constructor.prototype.start.apply(this, arguments);

    };

    // clear timeout
    this.stop = function() {
        this.constructor.prototype.stop.apply(this, arguments);

        if (this.timer) {
            if (this.method === 'interval') {
                clearTimeout(this.timer);
            } else {
                this.timer.clear();
            }
            this.timer = null;
        }
    };

};
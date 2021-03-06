var util = require('util'),
    microtime = require('microtime-x'),
    color = require('cli-color'),
    atoum = require('./atoum'),
    report = module.exports = function report(stdout) {
        this.stdout = stdout;
        this.color = {
            title: color.blue,
            success: color.green,
            error: color.red,
            header: color.bold,
            ribbon: {
                success: color.bgGreen.white,
                error: color.bgRed.white
            }
        };
    },
    priv = {
        failure: function(exception, out, color) {
            out.write(
                util.format(
                    '>>> ' + color.error('%s: %s') + '\n%s',
                    exception.name,
                    exception.message,
                    exception.stack
                )
            );
        }
    };

report.prototype = {
    register: function(dispatcher) {
        var color = this.color,
            out = this.stdout;

        dispatcher.on('runnerStart', function() {
            out.write(util.format(color.title('atoum.js %s\n\n'), atoum.version));
            out.write(util.format('> ' + color.header('node path') + ': %s\n', process.execPath));
            out.write(util.format('> ' + color.header('node versions') + ': %s\n', util.inspect(process.versions)));
            out.write('\n');
        });

        dispatcher.on('runnerStop', function(runner) {
            out.write(util.format('> ' + color.header('Total test duration') + ': %d second(s).\n', Math.round(runner.score.duration * 10000) / 10000));
            out.write(util.format('> ' + color.header('Total test memory usage') + ': %s\n', util.inspect(runner.score.usage.format('KB', 4).stat)));

            var tests = 0;
            for(var i in runner.score.tests) {
                if(runner.score.tests.hasOwnProperty(i)) tests++;
            }

            if(runner.score.passed === true) {
                out.write(util.format(
                    color.ribbon.success('Success (%d test(s), %d method(s), %d assertion(s)) !\n'),
                    tests,
                    runner.score.methods,
                    runner.generator.assertionsCount
                ));
            } else {
                out.write(util.format(
                    color.ribbon.success('Failure (%d/%d test(s), %d/%d method(s), %d assertion(s)) !\n'),
                    (tests - runner.score.failedTests),
                    tests,
                    (runner.score.methods - runner.score.failedMethods),
                    runner.score.methods,
                    runner.generator.assertionsCount
                ));

                if(runner.score.failures > 0) {
                    out.write(util.format('> ' + color.error('There were %d failures:') + '\n', runner.score.failures));
                    for(var t in runner.score.tests) {
                        if(runner.score.tests.hasOwnProperty(t) && runner.score.tests[t].failures.length > 0) {
                            out.write('>> ' + t + '\n');

                            for(var fail in runner.score.tests[t].failures) priv.failure(runner.score.tests[t].failures[fail], out, color);
                        }
                    }
                }

                if(runner.score.exceptions > 0) {
                    out.write(util.format('> ' + color.error('There were %d exceptions') + ':\n', runner.score.exceptions));
                    for(var t in runner.score.tests) {
                        if(runner.score.tests.hasOwnProperty(t) && runner.score.tests[t].exceptions.length > 0) {
                            out.write('>> ' + t + '\n');

                            for(var ex in runner.score.tests[t].exceptions) priv.failure(runner.score.tests[t].exceptions[ex], out, color);
                        }
                    }
                }

                if(runner.score.errors > 0) {
                    out.write(util.format('> ' + color.error('There were %d errors') + ':\n', runner.score.errors));
                    for(var t in runner.score.tests) {
                        if(runner.score.tests.hasOwnProperty(t) && runner.score.tests[t].errors.length > 0) {
                            out.write('>> ' + t + '\n');

                            for(var err in runner.score.tests[t].errors) priv.failure(runner.score.tests[t].errors[err], out, color);
                        }
                    }
                }
            }
        });

        dispatcher.on('testStart', function(test) {
            out.write(util.format('> ' + color.header('%s') + '\n', test.class));
            out.write('[');
        });

        dispatcher.on('testStop', function(test) {
            out.write(']\n');
            out.write(util.format('=> Test duration: %d second(s).\n', Math.round(test.score.duration * 10000) / 10000));
            out.write(util.format('=> Memore usage: %s\n', util.inspect(test.score.usage.format('KB', 4).stat)));
        });

        dispatcher.on('testMethodSuccess', function() { out.write(color.success('S')); });
        dispatcher.on('testMethodFailure', function() { out.write(color.error('F')); });
        dispatcher.on('testMethodException', function() { out.write(color.error('X')); });
        dispatcher.on('testMethodError', function() { out.write(color.error('E')); });

        return this;
    }
};

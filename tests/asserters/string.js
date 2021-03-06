var util = require('util'),
    atoum = require('../..'),
    variable = require('../../lib/asserters/variable'),
    testedClass = atoum.require('lib/asserters/string', module),
    unit = module.exports = {
        testClass: function() {
            var generator, object;

            this
                .if(generator = {})
                .then()
                    .object(object = new testedClass(generator)).isInstanceOf(variable)
                    .object(object.generator).isEqualTo(generator)
            ;
        },

        testSetWith: function() {
            var object, value;

            this
                .if(object = new testedClass({}))
                .then()
                    .error(function() {
                        object.setWith(value)
                    })
                        .hasName('Failure')
                        .hasMessage('undefined is not a string')
                .if(value = {})
                .then()
                    .error(function() {
                        object.setWith(value)
                    })
                        .hasName('Failure')
                        .hasMessage('[object Object] is not a string')
                .if(value = Math.random().toString(36).substring(7))
                .then()
                    .object(object.setWith(value)).isEqualTo(object)
                    .string(object.value).isEqualTo(value)
            ;
        },

        testHasLength: function() {
            var object, value;

            this
                .if(object = new testedClass({}))
                .and(object.setWith(''))
                .then()
                    .object(object.hasLength(0)).isIdenticalTo(object)
                .if(object.setWith(value = Math.random().toString(36).substring(7)))
                .then()
                    .error(function() {
                        object.hasLength(0);
                    })
                        .hasName('Failure')
                        .hasMessage(util.format('%s has not length 0', value))
                    .object(object.hasLength(value.length)).isIdenticalTo(object)
            ;
        }
    };

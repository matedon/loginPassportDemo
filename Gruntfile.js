"use strict";

const _ = require('lodash');

const assetResources = {
    js: {
        general: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/bootstrap-css/js/bootstrap.min.js',
            'bower_components/jquery.serializeJSON/jquery.serializejson.js',
            'bower_components/moment/min/moment-with-locales.min.js',
            'assets/main.js'
        ]
    },
    style: {
        less: [
            'assets/main.less'
        ]
    }
};

module.exports = function (grunt) {
    const
        gruntConfig = {},
        assetFiles = {
            less : {
                'public/_build/less.css': assetResources.style.less
            },
            uglify: {
                'public/_build/general.js': assetResources.js.general
            }
        },
        assetDisplay = _.map(assetFiles, function (group, key) {
            return _.map(Object.keys(group));
        });

    gruntConfig.less = {
        main: {
            options: {
                paths: [],
                map: true,
                compress: false,
                rebase: true,
                strictMath: true
            },
            files: assetFiles.less
        }
    };
    
    gruntConfig.uglify = {
        general: {
            options: {
                beautify: true,
                compress: false,
                mangle: false
            },
            files: assetFiles.uglify
        }
    };
    
    gruntConfig.copy = {
        files: {
            expand: true,
            flatten: true,
            cwd: '.',
            src: [
                'bower_components/bootstrap/fonts/*',
                'bower_components/components-font-awesome/fonts/*'
            ],
            dest: 'public/_build/fonts/',
            filter: 'isFile'
        }
    };

    gruntConfig.clean = {
        build: [
            'public/_build/*'
        ]
    };

    gruntConfig.shell = {
        gitadd: {
            command: 'git add public/_build/*'
        }
    };

    gruntConfig.cacheBust = {
        options: {
            deleteOriginals: true,
            assets: assetDisplay
        },
        main: {
            src: [
                'views/partials/resources/core-css.handlebars',
                'views/partials/resources/core-js.handlebars'
            ]
        }
    };

    gruntConfig.watch = {
        gruntConfig: {
            files: 'Gruntfile.js',
            tasks: ['default'],
            options: {
                interval: 1200
            }
        },
        general_js: {
            files: assetResources.js.general,
            tasks: ['uglify:general', 'task:gitadd'],
            options: {
                interval: 500
            }
        },
        less: {
            files: assetResources.style.less,
            tasks: ['task:less', 'task:gitadd'],
            options: {
                interval: 500
            }
        }
    };

    [
        'grunt-shell',
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin',
        'grunt-contrib-less',
        'grunt-cache-bust',
        'grunt-contrib-watch'
    ].forEach(function(name) {
        grunt.loadNpmTasks(name);
    });

    [
        ['task:gitadd', ['shell:gitadd']],
        ['task:clean:build', ['clean:build']],
        ['task:copy', ['copy']],
        ['task:watch', ['watch']],
        ['task:uglify', ['uglify']],
        ['task:less', ['less:main']],
        ['task:cacheBust', ['cacheBust:main']],
        ['default', [
            'task:clean:build',
            'task:copy',
            'task:uglify',
            'task:less',
            'task:cacheBust',
            'task:gitadd',
            'task:watch'
        ]]
    ].forEach(function(input) {
        grunt.registerTask(input[0], input[1]);
    });

    grunt.initConfig(gruntConfig);

};

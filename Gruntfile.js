"use strict";

const _ = require('lodash');

const assets = {
    js: {
        general: {
            'public/_build/general.js': [
                'bower_components/jquery/dist/jquery.min.js',
                'bower_components/bootstrap-css/js/bootstrap.min.js',
                'bower_components/jquery.serializeJSON/jquery.serializejson.js',
                'assets/main.js'
            ]
        }
    },
    css: {
        less: {
            'public/_build/less.css': [
                'assets/main.less'
            ]
        }
    }
};

module.exports = function (grunt) {
    const
        gruntConfig = {};

    gruntConfig.less = {
        main: {
            options: {
                paths: [],
                map: true,
                compress: false,
                rebase: true,
                strictMath: true
            },
            files: assets.css.less
        }
    };

    gruntConfig.uglify = {
        general: {
            options: {
                beautify: true,
                compress: false,
                mangle: false
            },
            files: assets.js.general
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
        js: [
            'public/_build/**/*.js'
        ],
        css: [
            'public/_build/**/*.css'
        ]
    };

    gruntConfig.shell = {
        gitAdd: {
            command: 'git add public/_build/*'
        }
    };

    gruntConfig.cacheBust = {
        options: {
            deleteOriginals: true,
            jsonOutput: true
        },
        js: {
            options: {
                assets: Object.keys(assets.js.general),
                jsonOutputFilename: 'public/_build/scripts.json'
            },
            src: ['index.html']
        },
        css: {
            options: {
                assets: Object.keys(assets.css.less),
                jsonOutputFilename: 'public/_build/styles.json'
            },
            src: ['index.html']
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
        assetJs: {
            files: _.chain(assets.js.general).values().head().value(),
            tasks: ['clean:js', 'task:uglify', 'cacheBust:js', 'task:gitAdd'],
            options: {
                interval: 500
            }
        },
        assetCss: {
            files: _.chain(assets.css.less).values().head().value(),
            tasks: ['clean:css', 'task:less', 'cacheBust:css', 'task:gitAdd'],
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
    ].forEach((name) => {
        grunt.loadNpmTasks(name);
    });

    [
        ['task:gitAdd', ['shell:gitAdd']],
        ['task:clean', ['clean:js', 'clean:css']],
        ['task:copy', ['copy']],
        ['task:watch', ['watch']],
        ['task:uglify', ['uglify']],
        ['task:less', ['less:main']],
        ['task:cacheBust', ['cacheBust:js', 'cacheBust:css']],
        ['default', [
            'task:clean',
            'task:copy',
            'task:uglify',
            'task:less',
            'task:cacheBust',
            'task:gitAdd',
            'task:watch'
        ]]
    ].forEach((input) => {
        grunt.registerTask(input[0], input[1]);
    });

    grunt.initConfig(gruntConfig);

};

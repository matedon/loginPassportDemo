"use strict";

const _ = require('lodash');

const resources = {
    js: {
        general: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/bootstrap-css/js/bootstrap.min.js',
            'bower_components/jquery.serializeJSON/jquery.serializejson.js',
            'bower_components/moment/min/moment-with-locales.min.js',
            'assets/main.js'
        ]
    },
    css: {
        less: [
            'assets/main.less'
        ]
    }
};

const assets = {
    js: {
        general: {
            files: resources.js.general,
            src: {
                'public/_build/general.js': resources.js.general
            }
        }
    },
    css: {
        less: {
            files: [
                resources.css.less
            ],
            src: {
                'public/_build/less.css': resources.css.less
            }
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
            files: assets.css.less.src
        }
    };

    gruntConfig.uglify = {
        general: {
            options: {
                beautify: true,
                compress: false,
                mangle: false
            },
            files: assets.js.general.src
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
                assets: Object.keys(assets.js.general.src),
                jsonOutputFilename: 'public/_build/scripts.json'
            },
            src: ['index.html']
        },
        css: {
            options: {
                assets: Object.keys(assets.css.less.src),
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
            files: assets.js.general.files,
            tasks: ['uglify:general', 'task:gitAdd'],
            options: {
                interval: 500
            }
        },
        assetCss: {
            files: assets.css.less.files,
            tasks: ['task:less', 'task:gitAdd'],
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
        ['task:gitAdd', ['shell:gitAdd']],
        ['task:clean:build', ['clean:build']],
        ['task:copy', ['copy']],
        ['task:watch', ['watch']],
        ['task:uglify', ['uglify']],
        ['task:less', ['less:main']],
        ['task:cacheBust', ['cacheBust:js', 'cacheBust:css']],
        ['default', [
            'task:clean:build',
            'task:copy',
            'task:uglify',
            'task:less',
            'task:cacheBust',
            'task:gitAdd',
            'task:watch'
        ]]
    ].forEach(function(input) {
        grunt.registerTask(input[0], input[1]);
    });

    grunt.initConfig(gruntConfig);

};

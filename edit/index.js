'use strict';
var ScriptBase = require('../sub-generator-base.js');
var helper = require('../helper.js');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');

module.exports = ScriptBase.extend({
    initializing: function ()
    {
        this.templateName = 'edit';
        // needs to be called manually
        this.init();

        this.subGenCfg = this.subGenerators[this.templateName];
        // the state name is the argument
        this.stateName = this.name + this.subGenCfg.stateSuffix;
        // instead use target folder to set the path
        this.targetFolder = path.join(this.dirs.routes);
        // names need to be reset
        this.setModuleNames(this.name);
    },

    prompting: function ()
    {
        // set context vars
        this.createTemplate = true;
        this.createController = true;

        // create overview files
        this.generateSourceAndTest('overview');
    },

    writing: function ()
    {
        var that = this;
        var done = this.async();

        // check if routes file does exist and create it if not
        if (that.uiRouter && that.routesFile) {
            fs.stat(that.routesFile, function (err, stat)
            {
                // if no route-file exist
                if (err) {
                    that.fs.copyTpl(
                        that.templatePath('aaal-routes' + that.fileExt.script),
                        that.destinationPath(that.routesFile),
                        that
                    );
                    that.log.writeln(chalk.yellow('Creating routes file at ' + that.routesFile + ' as none was present at the specified location'));
                    that.injectIntoRoutesFile = true;
                    done();
                } else {
                    that.injectIntoRoutesFile = true;
                    done();
                }
            });
        } else {
            this.log.writeln(chalk.yellow('No routes file provided in config or injection deactivated'));
            done();
        }
    },

    install: function ()
    {
        // SOMEWHAT HACKY, but not possible otherwise to run
        // after file creation due to how the run queue works
        // @see http://yeoman.io/authoring/running-context.html

        if (this.injectIntoRoutesFile) {
            this.log.writeln(chalk.yellow('injecting state into ' + this.routesFile));

            var routeUrl = '/' + this.formatNamePath(this.name) + '/' + this.formatNamePath(this.subGenCfg.stateSuffix),
                tplUrl = this.tplUrl,
                ctrl = !!this.createController && this.classedName + (this.subGenCfg.nameSuffix || '');

            helper.injectRoute(
                this.routesFile,
                this.stateName,
                routeUrl,
                tplUrl,
                ctrl,
                this
            );
        }
    }
});
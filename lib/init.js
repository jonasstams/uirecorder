var fs = require('fs-extra')
var path = require('path');
var inquirer = require('inquirer');
var i18n = require('./i18n');

var projectPath = path.resolve(__dirname, '../project');

function initConfig(options){
    var locale = options.locale;
    var mobile = options.mobile;
    var _host = options.host;
    var _port = options.port;
    if(locale){
        i18n.setLocale(locale);
    }
    var configPath = 'config.json';
    var configFile = path.resolve(configPath);
    var config = {};
    if(fs.existsSync(configFile)){
        var content = fs.readFileSync(configFile).toString();
        try{
            config = JSON.parse(content);
        }
        catch(e){}
    }
    var recorder;
    config.webdriver = config.webdriver || {};
    config.vars = config.vars || {};
    var webdriver = config.webdriver;
    webdriver.host = _host || '127.0.0.1';
    webdriver.port = _port || '4444';
    if(!mobile){
        config.recorder = {};
        recorder = config.recorder;
        recorder.pathAttrs = 'data-id,data-name,type,data-type,role,data-role,data-value';
        recorder.attrValueBlack = '';
        recorder.hideBeforeExpect = '';
        webdriver.browsers = 'chrome';
    }
    var questions = [];
    if(mobile){
        questions = [
            {
                'type': 'input',
                'name': 'host',
                'message': __('webdriver_host'),
                'default': webdriver.host,
                'filter': function(input){
                    return input.replace(/(^\s+|\s+$)/g, '');
                },
                'validate': function(input){
                    return input !== '' && /^https?:\/\//.test(input) === false;
                }
            },
            {
                'type': 'input',
                'name': 'port',
                'message': __('webdriver_port'),
                'default': webdriver.port,
                'filter': function(input){
                    return input.replace(/(^\s+|\s+$)/g, '');
                },
                'validate': function(input){
                    return input !== '';
                }
            }
        ];
    }
    else { // questions not mobile }
    }
    inquirer.prompt(questions).then(function(anwsers){
        webdriver.host = String(webdriver.host).replace(/^\s+|\s+$/g, '');
        webdriver.port = String(webdriver.port).replace(/^\s+|\s+$/g, '');
        if(!mobile){
            recorder.pathAttrs = String(recorder.pathAttrs).replace(/^\s+|\s+$/g, '');
            webdriver.browsers = String(webdriver.browsers).replace(/^\s+|\s+$/g, '');
        }
        fs.writeFileSync(configFile, JSON.stringify(config, null, 4));
        console.log(configPath.bold+' '+__('file_saved').green);
        if(mobile){
            initProject({
                'package.json':'',
                'README.md':'',
                'screenshots':'',
                'commons':'',
                '.editorconfig':'',
                '.gitignore1':'.gitignore',
                'install.sh':'',
                'run.bat':'',
                'run.sh':''
            });
        }
        else{
            var hostsPath = 'hosts';
            initProject({
                'package.json':'',
                'README.md':'',
                'screenshots':'',
                'commons':'',
                'uploadfiles':'',
                '.editorconfig':'',
                '.gitignore1':'.gitignore',
                'install.sh':'',
                'run.bat':'',
                'run.sh':'',
                'hosts': hostsPath
            });
        }
    }).catch(function(err){
        console.log(err)
    });

}

function initProject(mapFiles){
    for(var key in mapFiles){
        initProjectFileOrDir(key, mapFiles[key]);
    }
}

function initProjectFileOrDir(srcName, descName){
    descName = descName || srcName;
    var srcFile = projectPath + '/' + srcName;
    var destFile = path.resolve(descName);
    if(fs.existsSync(destFile) === false){
        fs.copySync(srcFile, destFile);
        console.log(descName.bold+' '+__(fs.statSync(srcFile).isDirectory()?'dir_created':'file_created').green);
    }
}

module.exports = initConfig;

(function() {
    'use strict';

    var LogLevel = {
        INFO: 0,
        DEBUG: 1,
        LOG: 2,
        WARN: 3,
        ERROR: 4,
        FATAL: 5
    };

    var Config = {
        consoleLogLevel: LogLevel.INFO,
        useColors: true,
        useStackTraces: true
    };

    // Save original console functions so we can output
    var consoleInfo = console.info,
        consoleLog = console.log,
        consoleWarn = console.warn,
        consoleError = console.error;

    // Number of lines to skip in the stack trace. Because the stack trace is
    // built by creating a new error at execution time, the first couple of
    // stack frames will be within this logging code for all messages. Adding
    // these to the stack trace is redundant.
    var CALL_DEPTH = 1;

    //
    // If the logStackTraces option is set, then this function is called to display log message stack traces as
    // collapsed log groups. The title of the log group will be the original output of the log message (objects and
    // multiple arguments are still supported). These can be expanded to reveal the stack traces from where the function
    // was called.
    //
    var extendedConsole = function(consoleMethod, stackTrace) {

        // We only want to output one error/warning per log message. The rest of the stack traces can just be logged.
        var currentConsoleMethod = consoleMethod;

        console.groupCollapsed.apply(this, [].slice.apply(arguments).slice(2));

        // Read the stack trace data from the error provided.
        stackTrace = stackTrace ? stackTrace.split("\n").slice(CALL_DEPTH) : [];

        for (var i = 0, ii = stackTrace.length; i < ii; i++) {
            currentConsoleMethod.call(this, stackTrace[i].trim());
            currentConsoleMethod = consoleLog;
        }

        console.groupEnd();
    };

    var extendedInfo = function(stack) {
        extendedConsole.apply(console, [consoleInfo, stack].concat([].slice.apply(arguments).slice(1)));
    };

    var extendedLog = function(stack) {
        extendedConsole.apply(console, [consoleLog, stack].concat([].slice.apply(arguments).slice(1)));
    };

    var extendedWarn = function(stack) {
        extendedConsole.apply(console, [consoleWarn, stack].concat([].slice.apply(arguments).slice(1)));
    };

    var extendedError = function(stack) {
        extendedConsole.apply(console, [consoleError, stack].concat([].slice.apply(arguments).slice(1)));
    };

    var getTimeStamp = function() {
        return new Date().toISOString();
    };

    /**
     * @example
     *
     * console.info("log");
     * console.error("error message with data", {a:'b'});
     *
     * @param {Number} level                    The log level to record the log messages at.
     * @param {Object} argsObject               An arguments object containing the log message objects.
     * @param {String|String[]} [stackTrace]    The stack trace leading to the caller of the log message.
     */
    var logMessage = function(level, argsObject, stackTrace) {
        var argsArray, css, logMethod;

        // Default log method is the standard console log
        logMethod = consoleLog;

        // Create stack trace if one doesn't already exist
        stackTrace = stackTrace ? stackTrace : new Error().stack;

        // Convert a stack trace array to a string for processing
        if(Array.isArray(stackTrace)) {
            stackTrace = stackTrace.join('\n');
        }

        //
        // Console output
        //

        if (level >= Config.consoleLogLevel) {
            if (Config.useColors) {
                switch (level) {
                    case LogLevel.FATAL:
                        css = 'background: #c40233; color: #fff';
                        break;
                    case LogLevel.ERROR:
                        css = 'background: #f8d6d6; color: #000';
                        break;
                    case LogLevel.WARN:
                        css = 'background: #ffffd8; color: #000';
                        break;
                    case LogLevel.LOG:
                        css = 'background: #fff; color: #000';
                        break;
                    case LogLevel.DEBUG:
                        css = 'background: #eaebef; color: #000';
                        break;
                    case LogLevel.INFO:
                        css = 'background: #e6e6ff; color: #000';
                        break;
                }

                if (css) {
                    css += '; padding:0 5px';
                }
                argsArray = ["%c" + getTimeStamp(), css];
            }
            else {
                argsArray = [getTimeStamp() + "  "];
            }

            switch (level) {
                case LogLevel.FATAL:
                case LogLevel.ERROR:
                    logMethod = Config.useStackTraces ? extendedError : consoleError;
                    break;
                case LogLevel.WARN:
                    logMethod = Config.useStackTraces ? extendedWarn : consoleWarn;
                    break;
                case LogLevel.LOG:
                case LogLevel.DEBUG:
                    logMethod = Config.useStackTraces ? extendedLog : consoleLog;
                    break;
                case LogLevel.INFO:
                    logMethod = Config.useStackTraces ? extendedInfo : consoleInfo;
                    break;
            }

            // Pass the stack trace data if we're going to output them to the console
            if (Config.useStackTraces) {
                argsArray = [stackTrace].concat(argsArray);
            }

            // Convert the arguments object to an array and prepend the level and/or timestamp to it
            argsArray = argsArray.concat([].slice.apply(argsObject));

            // Apply the log method
            logMethod.apply(console, argsArray);
        }
    };

    //
    // Override the console!
    //

    console.info  = function() { logMessage(LogLevel.INFO, arguments); };
    console.debug = function() { logMessage(LogLevel.DEBUG, arguments); };
    console.log   = function() { logMessage(LogLevel.LOG, arguments); };
    console.warn  = function() { logMessage(LogLevel.WARN, arguments); };
    console.error = function() { logMessage(LogLevel.ERROR, arguments); };
    console.fatal = function() { logMessage(LogLevel.FATAL, arguments); };
}());

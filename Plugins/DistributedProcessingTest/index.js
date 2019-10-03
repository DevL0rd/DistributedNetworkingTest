//Authour: Dustin Harris
//GitHub: https://github.com/DevL0rd
var startTime = new Date().getTime();
var endTime = new Date().getTime();
var workerIo;
var log;
function init(pluginExports, settings, events, io, nLog, commands, nWorkerIo) {
    log = nLog;
    workerIo = nWorkerIo;
    commands.refresh = {
        usage: "refresh",
        help: "Tell all clients to refresh.",
        do: function () {
            log("Forcing clients to refresh.", false, "BaseUtils");
            io.emit("forceRefresh");
        }
    };
    events.on("connection", function (socket) {
        socket.on('ping', function () {
            socket.emit('pong');
        });
    });
    if (workerIo.isWorker) {
        events.on("doJob", function (job) {
            if (job.jobName == "addAll") {
                job.complete(addAll(job.data));
            }
        });
    } else {
        test();
    }

}
function test() {
    if (workerIo.workerCount) { //if workers are available use them
        var randWork = [];
        var workCount = 8000
        while (workCount > 0) {
            randWork.push(1);
            workCount--;
        }
        startTime = new Date().getTime();
        addAll(randWork);
        endTime = new Date().getTime();
        var timeElapsed = endTime - startTime;
        log("Local test time: " + timeElapsed, false, "DP-Test");
        startTime = new Date().getTime();
        workerIo.queueJob("addAll", randWork, function (data) {
            endTime = new Date().getTime();
            var timeElapsed = endTime - startTime;
            log("Single Job test time: " + timeElapsed, false, "DP-Test");
            startTime = new Date().getTime();
            workerIo.doDistributedJob("addAll", randWork, function (results) {
                endTime = new Date().getTime();
                var timeElapsed = endTime - startTime;
                log("Distributed Job test time: " + timeElapsed, false, "DP-Test");
                setTimeout(test, 0);
            });
        });
    } else { //if no workers do the work here
        log("no workers connected", false, "DP-Test");
        setTimeout(test, 1000);
    }
}
function addAll(randWork) {
    var result = 0;
    for (i in randWork) {
        var r1 = randWork[i]
        for (i2 in randWork) {
            var r2 = randWork[i2]
            if (r1 > r2) result += 1
            if (r1 < r2) result += 1
            if (r1 <= r2) result += 1
            if (r1 >= r2) result += 1
            result += r2;
        }
    }
    return result;
}
function uninit(events, io, log, commands) {
    //Leave blank and let server know this can be reloaded
}
exports.init = init;
exports.uninit = uninit;
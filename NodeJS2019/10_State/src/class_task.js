let stateTask = {
    Init: 0,
    PreparedToRun: 1,
    Running: 2,
    Finished: 3,
    ExportedResults: 4,
    ToClear: 5
};

class Task {
    constructor(pName, pRequest) {
        this.name = pName;
        this.state = stateTask.Init;
        this.request = pRequest;
    }
};
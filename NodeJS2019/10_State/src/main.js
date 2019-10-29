function assertTask(pTask) {
    switch (pTask.state) {
        case 0:
            {
                console.log(pTask.name, "state ", states[pTask.state]);
                cbAdvanceState(pTask, assertTask);
                return;
            }
        case 1:
            {
                console.log(pTask.name, "state ", states[pTask.state]);
                cbAdvanceState(pTask, assertTask);
                return;
            }
        case 2:
            {
                console.log(pTask.name, "state ", states[pTask.state]);
                cbAdvanceState(pTask, assertTask);
                return;
            }
        case 3:
            {
                console.log(pTask.name, "state ", states[pTask.state]);
                cbAdvanceState(pTask, assertTask);
                return;
            }
        case 4:
            {
                console.log(pTask.name, "state ", states[pTask.state]);
                cbAdvanceState(pTask, assertTask);
                return;
            }
        case 5:
            {
                console.log(pTask.name, "state ", states[pTask.state]);
                return;
            }
    }
};

function cbAdvanceState(pTask, pCallback) {
    pTask.state++;
    pCallback(pTask);
};

let states = Object.keys(stateTask);

let t1 = new Task("t1", "r1");
console.log("state: ", t1);
assertTask(t1);
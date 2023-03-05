async function joinCrew() {
  const response = await fetch('/join', {
    method: 'POST'
  });
  const crewMemberId = await response.text();
  return crewMemberId;
}

async function getNextTask(crewMemberId) {
  const response = await fetch(`/crew/${crewMemberId}/tasks/next`, {method: 'GET'});
  
  if (response.status === 500) {
    return 'repair';
  } else if (response.status === 204) {
    return 'CONGRATS you won'; 
  } else {
    const task = await response.text();
    return task;
  }
}
async function getTaskData(crewMemberId, task) {
  const response = await fetch(`/crew/${crewMemberId}/tasks/${task}`,{method: 'GET'});
  return await response.json();
}

async function completeTask(crewMemberId, task, data) {
  let response;
  if (task === 'cleaning1') {
    const deduplicatedData = [...new Set(data)];
    response = await fetch(`/crew/${crewMemberId}/tasks/${task}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // or application/xml or text/plain
    },
      body: JSON.stringify(deduplicatedData)
      
    });
    
    // console.log(JSON.stringify(deduplicatedData));
  }else if (task === 'cleaning2') {
      const numbers = data.filter(str => !isNaN(str)).map(str => parseInt(str));//convert string to number 
      const nonNumbers = data.filter(str => isNaN(str));
      const taskData = { numbers, 'non-numbers': nonNumbers };
      response = await fetch(`/crew/${crewMemberId}/tasks/${task}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // or application/xml or text/plain
    },
      body: JSON.stringify(taskData)
    });
    // return {numbers, nonNumbers};
    // console.log(JSON.stringify(taskData));
  } else if (task === 'decoding') {
    const message = data.message.map(num => data.key[num]).join('');
    response = await fetch(`/crew/${crewMemberId}/tasks/${task}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // or application/xml or text/plain
    },
      body:(message)
    });
    console.log(message);
  } else if (task == 'repair') {
  response = await fetch(`/crew/${crewMemberId}/tasks/repair`);
  let data = await response.json();
  let result = Object.values(data).map(num => {
    if (num === 0) {
      return 0;
    }
    const positiveNum = Math.abs(num);
    const invertedNum = 1 / positiveNum;
    const cubedNum = invertedNum ** 3;
    const modulusNum = cubedNum % 360;
    return modulusNum;
  });
  
  response = await fetch(`/crew/${crewMemberId}/tasks/repair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  });
  }
  if (response.status === 200) {
    return 'success';
  } 
  else if(response.status == 202){
    return 'Not all task complete'
  }else if (response.status === 400) {
    return 'invalid input';
  } else if (response.status === 403) {
    return 'not authorized';
  }
}

async function run() {
  const crewMemberId = await joinCrew();
  let task = await getNextTask(crewMemberId);
  while (task !== 'CONGRATS you won') {
    const taskData = await getTaskData(crewMemberId, task);
    const taskResult = await completeTask(crewMemberId, task, taskData);
    if (taskResult === 'success') {
      task = await getNextTask(crewMemberId);
    } else {
      console.log(`Error: ${taskResult}`);
      break;
    }
  }
  console.log(task);
}



var tasks = {};

 // working on makind the li items, SLECTABLE
 $(".card .list-group").sortable({
  connectWith: $(".card .list-group"),

  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    // console.log("activate", this);
  },
  deactivate: function(event) {
    // console.log("deactivate", this);
  },
  over: function(event) {
    // console.log("over", event.target);
  },
  out: function(event) {
    // console.log("out", event.target);
  },
  update: function(event) {
    //temporary array to store the data in, later it will be pushed onto localStorage
    var tempArr = []

    //loop over current set of chuldren in sortable list
    $(this).children().each(function(){
      var text = $(this)
        .find("p")
        .text()
        .trim();
      
      var date = $(this)
        .find("span")
        .text()
        .trim();

    // add task info to the temp array as an object
    tempArr.push({
      text: text,
      date: date
      });
    });//END of children loop
    
    //each list has an ID, we will tirm down the portion that matches the keys in the tasks object
    var arrName = $(this)
    .attr("id")
    .replace("list-", ""); //replaces the portion mentioned with nothing, leaving behinf the status of the list
    //update array on task object and save
    tasks[arrName] = tempArr;
    saveTasks()

    console.log("tempArray", tempArr);
    console.log("tasksObjec", tasks);
  } //end of update declaration
});//end of the sortable function 


//implementing the DATEPICKER
$('#modalDueDate').datepicker({
    minDate: 1
});//end of datepicker function


var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date (passes the list element and it's infomration as a parameter)
  auditTask(taskLi)

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};



// AUDIT the task and color code depending on the dates
var auditTask =  function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  //convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  //remove any old classes from the element
  $("taskEl").removeClass("list-group-item-warning list-group-item-danger");

  //apply new class if task is near/over due date
  if(moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger");
     } 
    //check if date is imminent 
     else if (Math.abs(moment().diff(time, "days")) <=2 ) {
       $(taskEl).addClass("list-group-item-warning");
     }
};


var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// EDIT TASK event listener that will allow the task to be edited once the text is being clicked on
$(".list-group").on("click", "p", function() {
  var text = $(this) //selects the text value of the element clicked on, in this case the p and saves it into the variable text
    .text()
    .trim();

  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text); // creates a nex textarea and gives  passes the p text as the text value of this new text area

  $(this).replaceWith(textInput);  //replaced the clicked element with the newly created text area

  textInput.trigger("focus"); //automatically highlight the input box for to be edited
});


//SAVE EDITED TASK blur event will trigger as soon as the user interacts with anything other than the <textarea> element.
$(".list-group").on("blur", "textarea", function(){
  //get the text area current value text
  var text = $(this)
    .val()
    .trim();
  
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks()

  // convert the <textarea> back into a <p> element. 
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  //replace textarea with p element
  $(this).replaceWith(taskP)
});

// EDIT DUE DATE, ability to edit date when when due date <span> is clicked
$(".list-group").on("click", "span", function(){
  // get the current text
  var date = $(this)
    .text()
    .trim();
  //create a new input element and display the text value from the original date
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  //swap out the original span date with the newly created input element
  $(this).replaceWith(dateInput);

  //enable jqueryUI datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      //when calendar is closed, fore a change event on the 'dateInput'
      $(this).trigger("change");
    }
  });

  // automatically focus on the new element
  dateInput.trigger("focus");
});

//SAVE DUE DATE value of the date was upodated, this saves the new info once the uses click out of it
$(".list-group").on("change", "input[type='text']", function(){
  //get current text
  var date = $(this)
    .val()
    .trim();
  
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the task position in the list of other list elements
  var index = $(this)
    .closest(".list-group-item")
    .index();
  
  // update task in array and savwe to local storage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes and assign the value of the updated date
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  //replace the input type="text" element with the new <span> element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});


//TRASH area 
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",

  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  out: function(event, ui) {
    console.log("out")
  }
}); //end of trash.droppable function



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


document.querySelector("#wrapper").addEventListener("click", function(event) {
  if (event.target.matches(".task")) {
    console.log("dynamic task was clicked");
  }
 });




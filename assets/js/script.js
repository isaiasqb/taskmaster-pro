var tasks = {};

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


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
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
  //create a new inout element and display the text value from the original date
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  //swap out the original span date with the newly created input element
  $(this).replaceWith(dateInput);
  // automatically focus on the new element
  dateInput.trigger("focus");
});

//SAVE DUE DATE value of the date was upodated, this saves the new info once the uses click out of it
$(".list-group").on("blur", "input[type='text']", function(){
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
});



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
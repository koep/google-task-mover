/**
 * FINAL WORKING SCRIPT
 * Moves all past-due REGULAR Google Tasks to today.
 * NOTE: This script cannot move tasks that were generated from a Google Doc.
 * This is a limitation of the Google Tasks API.
 */
function moveOverdueRegularTasks() {
  const todayISO = new Date().toISOString();
  
  Logger.log('🚀 RUNNING IN LIVE MODE. Overdue regular tasks will be moved.');
  Logger.log('Note: Tasks from Google Docs will be skipped (API limitation).');

  try {
    const taskLists = Tasks.Tasklists.list().items;
    if (!taskLists || taskLists.length === 0) {
      Logger.log('No task lists found. Exiting.');
      return;
    }

    taskLists.forEach(function(taskList) {
      Logger.log('Processing list: "' + taskList.title + '"');
      
      const tasks = Tasks.Tasks.list(taskList.id, {
        showCompleted: false,
        showHidden: true
      }).items;

      if (!tasks || tasks.length === 0) {
        Logger.log(' -> No active tasks in this list.');
        return;
      }

      tasks.forEach(function(task) {
        if (task.due) {
          const dueDate = new Date(task.due);
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          // Find all tasks with a due date before today.
          if (dueDate < todayStart) {
            if (task.id && typeof task.id === 'string') {
              const cleanedTaskId = task.id.trim();
              try {
                // This will work for regular tasks and fail for Doc-generated tasks.
                task.due = todayISO;
                Tasks.Tasks.update(task, taskList.id, cleanedTaskId);
                Logger.log('  -> MOVED: "' + task.title + '" to today.');
              } catch (e) {
                // This error is expected for tasks linked from Google Docs.
                Logger.log('  -> SKIPPED: Task "' + task.title + '" could not be moved (likely from a Google Doc).');
              }
            }
          }
        }
      });
    });
    Logger.log('✅ Run finished.');

  } catch (e) {
    Logger.log('❌ A critical error occurred: ' + e.message);
  }
}

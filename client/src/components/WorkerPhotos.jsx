import React from 'react';

const WorkerPhotos = ({ tasks = [], isDark = false }) => {
  if (!tasks || tasks.length === 0) {
    console.log('WorkerPhotos: No tasks provided');
    return null;
  }

  // Find tasks with photos
  const photoTasks = tasks.filter(task => 
    task.before_photo || task.after_photo
  );

  console.log('WorkerPhotos: Filtering tasks', { 
    totalTasks: tasks.length, 
    photoTasks: photoTasks.length,
    sampleTask: tasks[0] 
  });

  if (photoTasks.length === 0) {
    console.log('WorkerPhotos: No tasks with photos found');
    return null;
  }

  console.log('WorkerPhotos: Rendering', { photoTasks });

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">📸</span>
        </div>
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
          Worker Resolution Photos
        </h3>
        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          {photoTasks.length} task{photoTasks.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photoTasks.map((task, idx) => (
          <div key={task._id || idx} className="space-y-2">
            {/* Task Header */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Task #{task._id?.slice(-6) || idx + 1}
              </span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                task.status === 'completed' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border border-slate-200'
              }`}>
                {task.status}
              </span>
            </div>

              {/* Before Photo */}
              {task.before_photo && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                    Before
                  </p>
                  <div className="relative group">
                    <img 
                      src={task.before_photo} 
                      alt="Before" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder.jpg"; // Fallback image
                        console.error("Failed to load before photo:", task.before_photo);
                      }}
                      onLoad={(e) => {
                        console.log("Successfully loaded before photo:", task.before_photo);
                      }}
                      className="w-full h-32 sm:h-44 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Before Photo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* After Photo */}
              {task.after_photo && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                    After
                  </p>
                  <div className="relative group">
                    <img 
                      src={task.after_photo} 
                      alt="After" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder.jpg"; // Fallback image
                        console.error("Failed to load after photo:", task.after_photo);
                      }}
                      onLoad={(e) => {
                        console.log("Successfully loaded after photo:", task.after_photo);
                      }}
                      className="w-full h-32 sm:h-44 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">After Photo</span>
                    </div>
                  </div>
                </div>
              )}

            {/* No photos */}
            {!task.before_photo && !task.after_photo && (
              <div className="h-44 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800">
                <span className="text-sm">No photos uploaded</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length > photoTasks.length && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic text-center">
          Additional {tasks.length - photoTasks.length} task(s) without photos
        </p>
      )}
    </section>
  );
};

export default WorkerPhotos;


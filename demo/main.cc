// 参考链接：
// https://github.com/keyou/chromium_demo/blob/c/110.0.5481/demo.cc

#include "base/at_exit.h"
#include "base/command_line.h"
#include "base/logging.h"
#include "base/run_loop.h"
#include "base/task/single_thread_task_executor.h"
#include "base/task/thread_pool/thread_pool_instance.h"

int main(int argc, char* argv[]) {
  base::AtExitManager at_exit;
  base::CommandLine::Init(argc, argv);
  logging::SetLogItems(true, false, true, false);

  base::SingleThreadTaskExecutor main_thread_task_executor;
  base::ThreadPoolInstance::CreateAndStartWithDefaultParams("demo");

  LOG(INFO) << "Hello, World!";
  base::RunLoop().Run();

  return 0;
}

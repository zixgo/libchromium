#include <iostream>

#include "base/bind.h"
#include "base/functional/bind.h"
#include "base/time/time.h"

int main(int argc, char* argv[]) {
  std::cout << base::Time::Now().ToInternalValue() << std::endl;
  //   auto callback = base::BindOnce();
  return 0;
}
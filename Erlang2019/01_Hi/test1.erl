% hello world program
-module(test1). 
-export([start/0]). 

start() -> 
   io:fwrite("Hi, world!\n").

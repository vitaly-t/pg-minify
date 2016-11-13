@echo off
SET PARAMS=--target es5 --noImplicitAny

call tsc main %PARAMS%
call tsc errors %PARAMS%

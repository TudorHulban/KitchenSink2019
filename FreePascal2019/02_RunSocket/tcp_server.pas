unit tcp_server;

{$mode objfpc}{$H+}

interface

uses
  Classes, SysUtils,
  //synapse
  blcksock, synsock,
  //custom
  tcp_action;

type
  TTCPEchoDaemon = class(TThread)
  private
    Sock: TTCPBlockSocket;
  public
    constructor Create;
    destructor Destroy; override;
    procedure Execute; override;
  end;

implementation

constructor TTCPEchoDaemon.Create;
begin
  inherited Create(False);
  Sock := TTCPBlockSocket.Create;
  FreeOnTerminate := True;
end;


destructor TTCPEchoDaemon.Destroy;
begin
  Sock.Free;
end;

procedure TTCPEchoDaemon.Execute;
var
  ClientSock: TSocket;
begin
  with Sock do
  begin
    CreateSocket;
    setLinger(True, 10000);
    bind('127.0.0.1', '8081');
    listen;
    repeat
      if terminated then
        break;
      if canread(1000) then
      begin
        ClientSock := accept;
        if lastError = 0 then
          TTCPAction.Create(ClientSock);
      end;
    until False;
  end;
end;

end.

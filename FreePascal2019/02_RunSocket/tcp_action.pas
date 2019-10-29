unit tcp_action;

{$mode objfpc}{$H+}

interface

uses
  Classes, SysUtils,
  //synapse
  blcksock, synsock;

type
  TTCPAction = class(TThread)
  private
    Sock: TTCPBlockSocket;
    CSock: TSocket;
  public
    constructor Create(Hsock: TSocket);
    procedure Execute; override;
  end;

implementation

constructor TTCPAction.Create(Hsock: TSocket);
begin
  inherited Create(False);
  Csock := Hsock;
  FreeOnTerminate := True;
end;

procedure TTCPAction.Execute;
var
  s: string;
begin
  sock := TTCPBlockSocket.Create;
  try
    sock.socket := CSock;
    sock.GetSins;
    with sock do
    begin
      repeat
        if terminated then
          break;
        s := RecvPacket(60000);
       writeln(s);
        if lastError <> 0 then
          break;
        SendString(s);
        if lastError <> 0 then
          break;
      until False;
    end;
  finally
    Sock.Free;
  end;
end;

end.

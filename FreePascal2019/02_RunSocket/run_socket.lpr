program run_socket;

{$mode objfpc}{$H+}

uses
  {$IFDEF UNIX}{$IFDEF UseCThreads}
  cthreads,
  {$ENDIF}{$ENDIF}
  Classes, SysUtils, CustApp, tcp_server, tcp_action
  { you can add units after this };

type

  { TSocketRun }

  TSocketRun = class(TCustomApplication)
  protected
    procedure DoRun; override;
  public
    constructor Create(TheOwner: TComponent); override;
    destructor Destroy; override;
  end;

{ TSocketRun }

procedure TSocketRun.DoRun;
var
  ErrorMsg: String;
begin

  { add your program here }

  // stop program loop
  Terminate;
end;

constructor TSocketRun.Create(TheOwner: TComponent);
begin
  inherited Create(TheOwner);
  StopOnException:=True;
end;

destructor TSocketRun.Destroy;
begin
  inherited Destroy;
end;

var
  Application: TSocketRun;
begin
  Application:=TSocketRun.Create(nil);
  Application.Title:='Run Command Socket';
  Application.Run;
  Application.Free;
end.


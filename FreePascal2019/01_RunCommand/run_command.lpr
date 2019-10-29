program run_command;

{$mode objfpc}{$H+}

uses {$IFDEF UNIX}
  cthreads, {$ENDIF}
  Classes,
  SysUtils,
  CustApp,
  process;

type

  { TRunCommand }

  TRunCommand = class(TCustomApplication)
  protected
    procedure DoRun; override;
  public
    constructor Create(TheOwner: TComponent); override;
    destructor Destroy; override;
  end;

  { TRunCommand }

  procedure TRunCommand.DoRun;
  var
    process: TProcess;

  begin
    if ParamCount = 2 then
    begin
      // usage : ./run_command chartConfig.json chart.png
      process := TProcess.Create(nil);
      process.Executable := 'highcharts-export-server';
      process.Parameters.Add('-infile');
      process.Parameters.Add(ParamStr(1));    // 'chartConfig.json'
      process.Parameters.Add('-outfile');
      process.Parameters.Add(ParamStr(2));    // 'chart.png'
      process.Options := process.Options + [poNoConsole];
      process.Execute;
      FreeAndNil(process);
    end;

    Terminate;
  end;

  constructor TRunCommand.Create(TheOwner: TComponent);
  begin
    inherited Create(TheOwner);
    StopOnException := True;
  end;

  destructor TRunCommand.Destroy;
  begin
    inherited Destroy;
  end;

var
  Application: TRunCommand;

{$R *.res}

begin
  Application := TRunCommand.Create(nil);
  Application.Title:='Run Command';
  Application.Run;
  Application.Free;
end.

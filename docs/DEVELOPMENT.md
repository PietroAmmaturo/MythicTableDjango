# Development
## Startup script

`Start-DevEnv.ps1` is meant for first time users and as a shortcut to get the environment running.

The script should open a browser for you, but you can reach the application by going to <http://localhost:5000> if it does not. The script is also designed to check for high level dependencies (i.e. .NET Core 3.0).

The commands will run both the client and server in auto-compile mode, and it is not
necessary to explicitly compile the server side code using Visual Studio or `dotnet`.  Client side
JavaScript/Vue and CSS will auto-update as changes are made, although please refresh
as needed.

Both running processes can be stopped using `Ctrl-c` or by exiting their respective windows.

#### -isFirstTime
If you use the `-isFirstTime` parameter (`Start-DevEnv.ps1 -isFirstTime`). This will then check for dependencies and run the following before starting the dev environment:

  - `dotnet dev-certs https` 
  - `dotnet dev-certs https --trust` 
  - `npm install`
  - `npm install vue-cli`


## Debugging the Server

To debug the server using Visual Studio, make sure that an instance is not currently running.
An instance that is running in a console window using `dotnet` can be stopped with `Ctrl-c`.

Set the Start Up project to `server/MythicTable` and `Debug -> Start Debugging`.

Requests can be made to the server directly at <https://localhost:5001/>.


## Debugging the Client

For development, the HTML/Javascript client uses facilities provided by Node.js and `vue-cli`
to enable code auto-update, as well as debugging hooks for single file Vue components that
must be compiled.

The recommended way to debug the client code is to use Chrome's built-in debugger.  Source code
belonging to compiled code can be found in the `webpack://` section of the source browser.  You
can set breakpoints and step through the code as if it were regular Javascript.

There is also a Vue.js devtools extension available for [Firefox](https://addons.mozilla.org/en-CA/firefox/addon/vue-js-devtools/) and [Chrome](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd?hl=en)

## Non-Powershell startup/Not using 'Start-DevEnv.ps1'

Some users might not want to use Powershell. And that's OK! 

It's a bit more manual but you can get started by completing the following:

1. [Install .NET Core SDK, version 3.0 or higher](https://dotnet.microsoft.com/download) (backend)
2. Install node.js using Visual Studio Installer or [nodejs.org](https://nodejs.org/en/download/) (frontend)
3. 
4. Run from within `mythictable/html`:
   - `npm install`
   - `npm start`
5. Run `dotnet watch run` from within `mythictable/server/src/MythicTable`
6. Browse to `https://localhost:5000`

## Seeding the DB

Run `dotnet run /seed` from within the MythicAuth folder. This will create and update a sqlite .db file based on `SeedData.cs`

local obs = obslua

local directory = "C:\\Users\\kamii\\Desktop\\laneso-credits"
local start = directory .. "\\start.vbs"
local stop = directory .. "\\stop.vbs"
local is_running = false

local function start_server()
    if is_running then
        return
    end

    os.execute(string.format('start "" wscript.exe "%s"', start))
    is_running = true
end

local function stop_server()
    if not is_running then
        return
    end
    os.execute(string.format('start "" wscript.exe "%s"', stop))
    is_running = false
end

local function on_event(event)
    if event == obs.OBS_FRONTEND_EVENT_FINISHED_LOADING then
        start_server()
    elseif event == obs.OBS_FRONTEND_EVENT_EXIT then
        stop_server()
    end
end

function script_description()
    return "inicia o laneso-credits quando abre o obs e fecha o laneso-credits quando fecha o obs!"
end

function script_load(settings)
    obs.obs_frontend_add_event_callback(on_event)
end

function script_unload()
    obs.timer_remove(start_server_delayed)
    stop_server()
end
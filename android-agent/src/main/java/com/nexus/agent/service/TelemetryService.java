package com.nexus.agent.service;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.widget.Toast;
import com.nexus.agent.ApiClient;
import com.nexus.agent.Utils;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

public class TelemetryService extends Service {
    
    private Timer telemetryTimer;
    private Handler mainHandler;

    @Override
    public void onCreate() {
        super.onCreate();
        mainHandler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (!Utils.isConsentGiven(this)) {
            stopSelf();
            return START_NOT_STICKY;
        }

        // Start telemetry collection every 60 seconds
        telemetryTimer = new Timer();
        telemetryTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                collectAndSendTelemetry();
            }
        }, 5000, 60000); // Delay 5s, then every 60s

        return START_STICKY;
    }

    private void collectAndSendTelemetry() {
        String agentId = Utils.getAgentId(this);
        
        try {
            // Collect device metrics
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("memory_mb", Utils.getSystemMemory());
            metadata.put("processors", Utils.getProcessorCount());
            metadata.put("cpu_usage", Utils.getCpuUsage());
            metadata.put("timestamp", System.currentTimeMillis());
            metadata.put("device", android.os.Build.DEVICE);
            metadata.put("model", android.os.Build.MODEL);

            // Send telemetry
            ApiClient.sendTelemetry(agentId, "info", "Regular telemetry update", metadata);
            
            // Send heartbeat
            ApiClient.sendHeartbeat(agentId);
            
            // Check for pending commands
            String commandsJson = ApiClient.getPendingCommands(agentId);
            if (commandsJson != null && !commandsJson.isEmpty()) {
                processPendingCommands(commandsJson);
            }

        } catch (Exception e) {
            ApiClient.sendTelemetry(agentId, "error", "Telemetry collection error: " + e.getMessage(), null);
        }
    }

    private void processPendingCommands(String commandsJson) {
        try {
            // Parse and execute commands
            // This is a placeholder - in production would parse JSON and execute safely
            mainHandler.post(() -> Toast.makeText(TelemetryService.this, "Commands received", Toast.LENGTH_SHORT).show());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (telemetryTimer != null) {
            telemetryTimer.cancel();
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

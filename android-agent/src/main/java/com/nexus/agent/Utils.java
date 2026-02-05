package com.nexus.agent;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import java.util.UUID;

public class Utils {
    
    private static final String PREFS_NAME = "NexusAgentPrefs";
    private static final String AGENT_ID_KEY = "agent_id";

    public static String getOrCreateAgentId(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String agentId = prefs.getString(AGENT_ID_KEY, null);
        
        if (agentId == null) {
            agentId = UUID.randomUUID().toString();
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString(AGENT_ID_KEY, agentId);
            editor.apply();
        }
        
        return agentId;
    }

    public static String getDeviceInfo(Context context) {
        StringBuilder sb = new StringBuilder();
        sb.append("Device: ").append(Build.DEVICE).append("\n");
        sb.append("Model: ").append(Build.MODEL).append("\n");
        sb.append("Manufacturer: ").append(Build.MANUFACTURER).append("\n");
        sb.append("OS: ").append(Build.VERSION.RELEASE).append("\n");
        sb.append("SDK: ").append(Build.VERSION.SDK_INT).append("\n");
        return sb.toString();
    }

    public static String getAgentId(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(AGENT_ID_KEY, "unknown");
    }

    public static String getHostname() {
        return Build.DEVICE + "_" + Build.MODEL.replace(" ", "_");
    }

    public static boolean isConsentGiven(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getBoolean("consent_given", false);
    }

    public static long getSystemMemory() {
        Runtime runtime = Runtime.getRuntime();
        return runtime.totalMemory() / (1024 * 1024);
    }

    public static int getProcessorCount() {
        return Runtime.getRuntime().availableProcessors();
    }

    public static float getCpuUsage() {
        try {
            java.lang.reflect.Method getLoadAverage = Runtime.class.getMethod("getLoadAverage");
            double[] loadAverage = (double[]) getLoadAverage.invoke(Runtime.getRuntime());
            if (loadAverage != null && loadAverage.length > 0) {
                return (float) loadAverage[0];
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }
}

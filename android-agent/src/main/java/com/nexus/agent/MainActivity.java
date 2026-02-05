package com.nexus.agent;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {

    private static final String PREFS_NAME = "NexusAgentPrefs";
    private Button consentButton;
    private Button rejectButton;
    private TextView statusText;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        
        consentButton = findViewById(R.id.consent_button);
        rejectButton = findViewById(R.id.reject_button);
        statusText = findViewById(R.id.status_text);

        boolean consentGiven = prefs.getBoolean("consent_given", false);
        
        if (consentGiven) {
            statusText.setText("Telemetry: ENABLED\nAgent ID: " + prefs.getString("agent_id", "unknown"));
            consentButton.setEnabled(false);
            rejectButton.setText("Disable Telemetry");
        }

        consentButton.setOnClickListener(v -> giveConsent());
        rejectButton.setOnClickListener(v -> rejectConsent());
    }

    private void giveConsent() {
        String agentId = Utils.getOrCreateAgentId(this);
        String hostname = android.os.Build.DEVICE;
        String os = "android";

        // Register agent with consent
        new Thread(() -> {
            try {
                String response = ApiClient.sendConsent(agentId, hostname, os, true);
                runOnUiThread(() -> {
                    if (response != null) {
                        SharedPreferences.Editor editor = prefs.edit();
                        editor.putBoolean("consent_given", true);
                        editor.putString("agent_id", agentId);
                        editor.apply();
                        
                        statusText.setText("Telemetry: ENABLED\nAgent ID: " + agentId);
                        consentButton.setEnabled(false);
                        rejectButton.setText("Disable Telemetry");
                        Toast.makeText(MainActivity.this, "Consent recorded", Toast.LENGTH_SHORT).show();
                        
                        // Start telemetry service
                        startService(new Intent(MainActivity.this, com.nexus.agent.service.TelemetryService.class));
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        }).start();
    }

    private void rejectConsent() {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean("consent_given", false);
        editor.apply();
        
        statusText.setText("Telemetry: DISABLED");
        consentButton.setEnabled(true);
        rejectButton.setText("Reject");
        Toast.makeText(this, "Consent revoked", Toast.LENGTH_SHORT).show();
        
        // Stop telemetry service
        stopService(new Intent(this, com.nexus.agent.service.TelemetryService.class));
    }
}

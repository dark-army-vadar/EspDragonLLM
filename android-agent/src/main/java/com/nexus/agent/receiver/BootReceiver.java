package com.nexus.agent.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.nexus.agent.Utils;
import com.nexus.agent.service.TelemetryService;

public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // Start telemetry service if consent was given
            if (Utils.isConsentGiven(context)) {
                Intent serviceIntent = new Intent(context, TelemetryService.class);
                context.startService(serviceIntent);
            }
        }
    }
}

package com.nexus.agent;

import okhttp3.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class ApiClient {
    
    private static final String C2_URL = "http://localhost:5000/api";
    private static final OkHttpClient client = new OkHttpClient();
    private static final Gson gson = new Gson();

    public static String sendConsent(String agentId, String hostname, String os, boolean consentGiven) throws IOException {
        JsonObject json = new JsonObject();
        json.addProperty("agentId", agentId);
        json.addProperty("hostname", hostname);
        json.addProperty("os", os);
        json.addProperty("consentGiven", consentGiven);

        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url(C2_URL + "/device/consent")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            return response.body() != null ? response.body().string() : null;
        }
    }

    public static String sendTelemetry(String agentId, String level, String message, Map<String, Object> metadata) throws IOException {
        JsonObject json = new JsonObject();
        json.addProperty("agentId", agentId);
        json.addProperty("level", level);
        json.addProperty("message", message);
        
        if (metadata != null && !metadata.isEmpty()) {
            json.add("metadata", gson.toJsonTree(metadata));
        }

        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url(C2_URL + "/device/telemetry")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            return response.body() != null ? response.body().string() : null;
        }
    }

    public static String registerAgent(String agentId, String hostname, String os) throws IOException {
        JsonObject json = new JsonObject();
        json.addProperty("id", agentId);
        json.addProperty("hostname", hostname);
        json.addProperty("os", os);
        json.addProperty("status", "online");

        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url(C2_URL + "/agents/register")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            return response.body() != null ? response.body().string() : null;
        }
    }

    public static String getPendingCommands(String agentId) throws IOException {
        Request request = new Request.Builder()
                .url(C2_URL + "/agents/" + agentId + "/commands")
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            return response.body() != null ? response.body().string() : null;
        }
    }

    public static String reportCommandResult(int commandId, String status, String output) throws IOException {
        JsonObject json = new JsonObject();
        json.addProperty("status", status);
        json.addProperty("output", output);

        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url(C2_URL + "/commands/" + commandId + "/result")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            return response.body() != null ? response.body().string() : null;
        }
    }

    public static String sendHeartbeat(String agentId) throws IOException {
        Request request = new Request.Builder()
                .url(C2_URL + "/agents/" + agentId + "/heartbeat")
                .post(RequestBody.create("", MediaType.parse("application/json")))
                .build();

        try (Response response = client.newCall(request).execute()) {
            return response.body() != null ? response.body().string() : null;
        }
    }
}

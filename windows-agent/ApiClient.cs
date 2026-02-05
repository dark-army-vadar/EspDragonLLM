using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace NexusWindowsAgent
{
    public class ApiClient
    {
        private static readonly HttpClient client = new HttpClient();
        private const string C2_URL = "http://localhost:5000/api";

        public static async Task<string> SendConsentAsync(string agentId, string hostname, string os, bool consentGiven)
        {
            var data = new
            {
                agentId = agentId,
                hostname = hostname,
                os = os,
                consentGiven = consentGiven
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(data),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            try
            {
                var response = await client.PostAsync(C2_URL + "/device/consent", content);
                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending consent: " + ex.Message);
                return null;
            }
        }

        public static async Task<string> SendTelemetryAsync(string agentId, string level, string message, object metadata = null)
        {
            var data = new
            {
                agentId = agentId,
                level = level,
                message = message,
                metadata = metadata
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(data),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            try
            {
                var response = await client.PostAsync(C2_URL + "/device/telemetry", content);
                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending telemetry: " + ex.Message);
                return null;
            }
        }

        public static async Task<string> RegisterAgentAsync(string agentId, string hostname, string os)
        {
            var data = new
            {
                id = agentId,
                hostname = hostname,
                os = os,
                status = "online"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(data),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            try
            {
                var response = await client.PostAsync(C2_URL + "/agents/register", content);
                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error registering agent: " + ex.Message);
                return null;
            }
        }

        public static async Task<string> SendHeartbeatAsync(string agentId)
        {
            try
            {
                var response = await client.PostAsync(
                    C2_URL + "/agents/" + agentId + "/heartbeat",
                    new StringContent("", System.Text.Encoding.UTF8, "application/json")
                );
                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending heartbeat: " + ex.Message);
                return null;
            }
        }

        public static async Task<string> GetPendingCommandsAsync(string agentId)
        {
            try
            {
                var response = await client.GetAsync(C2_URL + "/agents/" + agentId + "/commands");
                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error getting commands: " + ex.Message);
                return null;
            }
        }
    }
}

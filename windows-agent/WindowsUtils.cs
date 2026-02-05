using System;
using System.Diagnostics;
using System.Management;
using System.Net.NetworkInformation;
using System.Linq;

namespace NexusWindowsAgent
{
    public class WindowsUtils
    {
        public static string GetOrCreateAgentId()
        {
            string appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string agentIdFile = System.IO.Path.Combine(appDataPath, "NexusAgent", "agent.id");

            if (System.IO.File.Exists(agentIdFile))
            {
                return System.IO.File.ReadAllText(agentIdFile).Trim();
            }

            string agentId = Guid.NewGuid().ToString();
            System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(agentIdFile));
            System.IO.File.WriteAllText(agentIdFile, agentId);
            return agentId;
        }

        public static string GetHostname()
        {
            return Environment.MachineName;
        }

        public static long GetTotalMemoryMB()
        {
            try
            {
                ObjectQuery objectQuery = new ObjectQuery("Select * from Win32_ComputerSystem");
                ManagementObjectSearcher managementObjectSearcher = new ManagementObjectSearcher(objectQuery);
                ManagementObjectCollection managementObjectCollection = managementObjectSearcher.Get();

                foreach (ManagementObject managementObject in managementObjectCollection)
                {
                    object totalPhysicalMemory = managementObject["TotalPhysicalMemory"];
                    if (totalPhysicalMemory != null)
                    {
                        return Convert.ToInt64(totalPhysicalMemory) / (1024 * 1024);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error getting memory: " + ex.Message);
            }
            return 0;
        }

        public static float GetCpuUsage()
        {
            try
            {
                PerformanceCounter cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total", true);
                cpuCounter.NextValue();
                System.Threading.Thread.Sleep(100);
                return cpuCounter.NextValue();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error getting CPU usage: " + ex.Message);
                return 0;
            }
        }

        public static int GetProcessorCount()
        {
            return Environment.ProcessorCount;
        }

        public static string GetOSVersion()
        {
            return Environment.OSVersion.VersionString;
        }

        public static bool IsConsentGiven()
        {
            string appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string consentFile = System.IO.Path.Combine(appDataPath, "NexusAgent", "consent.flag");
            return System.IO.File.Exists(consentFile);
        }

        public static void SetConsent(bool value)
        {
            string appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string consentFile = System.IO.Path.Combine(appDataPath, "NexusAgent", "consent.flag");
            System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(consentFile));
            
            if (value)
            {
                System.IO.File.WriteAllText(consentFile, "1");
            }
            else if (System.IO.File.Exists(consentFile))
            {
                System.IO.File.Delete(consentFile);
            }
        }

        public static string GetSystemInfo()
        {
            return $"OS: {GetOSVersion()}, Hostname: {GetHostname()}, Processors: {GetProcessorCount()}";
        }
    }
}

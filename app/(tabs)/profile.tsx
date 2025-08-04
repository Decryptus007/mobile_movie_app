import * as Battery from "expo-battery";
import * as Device from "expo-device";
import * as Network from "expo-network";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

interface PhoneDetails {
  model: string | null;
  brand: string | null;
  manufacturer: string | null;
  systemName: string;
  systemVersion: string;
  deviceName: string | null;
  batteryLevel: string;
  deviceType: string;
  isTablet: boolean;
  screenResolution: string;
  fontScale: number;
  localIpAddress: string | null;
  networkState: string;
  isConnected: boolean;
  deviceYearClass: number | null;
  totalMemory: string | null;
  modelId: string | null;
}

interface IPResponse {
  ip: string;
}

interface HttpBinResponse {
  origin: string;
}

const Profile: React.FC = () => {
  const [userIP, setUserIP] = useState<string | null>(null);
  const [phoneDetails, setPhoneDetails] = useState<PhoneDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to get user's actual IP address
  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data: IPResponse = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP:", error);
      // Fallback to another IP service
      try {
        const fallbackResponse = await fetch("https://httpbin.org/ip");
        const fallbackData: HttpBinResponse = await fallbackResponse.json();
        return fallbackData.origin;
      } catch (fallbackError) {
        console.error("Fallback IP fetch failed:", fallbackError);
        return "Unable to fetch IP";
      }
    }
  };

  // Function to get actual phone/device specifications using Expo APIs
  const getPhoneDetails = async (): Promise<PhoneDetails | null> => {
    try {
      // Get screen dimensions
      const { width, height } = Dimensions.get("screen");
      const { fontScale } = Dimensions.get("window");

      // Get network information
      const networkState = await Network.getNetworkStateAsync();
      const ipAddress = await Network.getIpAddressAsync();

      // Get battery level
      let batteryLevel = "Unknown";
      try {
        const batteryState = await Battery.getBatteryLevelAsync();
        batteryLevel = `${Math.round(batteryState * 100)}%`;
      } catch (batteryError) {
        console.log("Battery info not available:", batteryError);
      }

      return {
        model: Device.modelName,
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        systemName: Device.osName || Platform.OS,
        systemVersion: Device.osVersion || "Unknown",
        deviceName: Device.deviceName,
        batteryLevel,
        deviceType: Device.deviceType
          ? Device.DeviceType[Device.deviceType]
          : "Unknown",
        isTablet: Device.deviceType === Device.DeviceType.TABLET,
        screenResolution: `${width} x ${height}`,
        fontScale,
        localIpAddress: ipAddress,
        networkState: networkState.type ?? "Unknown",
        isConnected: networkState.isConnected || false,
        deviceYearClass: Device.deviceYearClass,
        totalMemory: Device.totalMemory
          ? `${(Device.totalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB`
          : null,
        modelId: Device.modelId,
      };
    } catch (error) {
      console.error("Error fetching device info:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const [ip, phoneInfo] = await Promise.all([
          getUserIP(),
          getPhoneDetails(),
        ]);

        setUserIP(ip);
        setPhoneDetails(phoneInfo);
      } catch (error) {
        Alert.alert("Error", "Failed to load profile data");
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-5">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-base text-slate-400 text-center">
          Loading Profile...
        </Text>
      </View>
    );
  }

  const InfoRow: React.FC<{
    label: string;
    value: string;
    isMonospace?: boolean;
  }> = ({ label, value, isMonospace = false }) => (
    <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
      <Text className="text-base font-medium text-slate-400 flex-1">
        {label}:
      </Text>
      <Text
        className={`text-base text-white flex-1 text-right ${
          isMonospace ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-primary p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 80, paddingTop: 50 }}>
        <Text className="text-3xl font-bold text-white mb-8 text-center">
          Profile
        </Text>

        {/* Network Information Section */}
        <View className="bg-primary rounded-xl p-4 mb-5 shadow-lg">
          <Text className="text-lg font-semibold text-blue-600 mb-4 border-b border-gray-200 pb-2">
            Network Information
          </Text>
          <InfoRow
            label="Public IP"
            value={userIP || "Loading..."}
            isMonospace
          />
          {phoneDetails?.localIpAddress && (
            <InfoRow
              label="Local IP"
              value={phoneDetails.localIpAddress}
              isMonospace
            />
          )}
          <InfoRow
            label="Network Type"
            value={phoneDetails?.networkState || "Unknown"}
          />
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-base font-medium text-slate-400 flex-1">
              Connected:
            </Text>
            <Text className="text-base text-white flex-1 text-right">
              {phoneDetails?.isConnected ? "Yes" : "No"}
            </Text>
          </View>
        </View>

        {/* Device Information Section */}
        <View className="bg-primary rounded-xl p-4 mb-5 shadow-lg">
          <Text className="text-lg font-semibold text-blue-600 mb-4 border-b border-gray-200 pb-2">
            Device Specifications
          </Text>
          {phoneDetails && (
            <>
              <InfoRow
                label="Device Name"
                value={phoneDetails.deviceName || "Unknown"}
              />
              <InfoRow label="Model" value={phoneDetails.model || "Unknown"} />
              <InfoRow
                label="Model ID"
                value={phoneDetails.modelId || "Unknown"}
              />
              <InfoRow label="Brand" value={phoneDetails.brand || "Unknown"} />
              <InfoRow
                label="Manufacturer"
                value={phoneDetails.manufacturer || "Unknown"}
              />
              <InfoRow label="OS" value={phoneDetails.systemName} />
              <InfoRow label="OS Version" value={phoneDetails.systemVersion} />
              <InfoRow label="Device Type" value={phoneDetails.deviceType} />
              <InfoRow
                label="Is Tablet"
                value={phoneDetails.isTablet ? "Yes" : "No"}
              />
              {phoneDetails.deviceYearClass && (
                <InfoRow
                  label="Device Year Class"
                  value={phoneDetails.deviceYearClass.toString()}
                />
              )}
              <InfoRow
                label="Screen Resolution"
                value={phoneDetails.screenResolution}
                isMonospace
              />
              {phoneDetails.totalMemory && (
                <InfoRow
                  label="Total Memory"
                  value={phoneDetails.totalMemory}
                />
              )}
              <InfoRow
                label="Battery Level"
                value={phoneDetails.batteryLevel}
              />
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-base font-medium text-slate-400 flex-1">
                  Font Scale:
                </Text>
                <Text className="text-base text-white flex-1 text-right">
                  {phoneDetails.fontScale}x
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

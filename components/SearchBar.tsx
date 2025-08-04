import { icons } from "@/constants/icons";
import React from "react";
import { Image, TextInput, View } from "react-native";

interface Props {
  placeholder?: string;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
  value?: string;
}

const SearchBar = ({ placeholder, onPress, onChangeText, value }: Props) => {
  return (
    <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
      <Image
        source={icons.search}
        className="size-5 mr-2"
        resizeMode="contain"
        tintColor={"#ab8bff"}
      />
      <TextInput
        onPress={onPress}
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
        className="flex-1 text-white"
        placeholderTextColor={"#a8b5db"}
      />
    </View>
  );
};

export default SearchBar;

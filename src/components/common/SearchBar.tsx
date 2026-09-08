import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import { remotePlaceholders } from "../../constants/remotePlaceholders";
import AppImage from "./AppImage";
import TextInput from "./TextInput";

type SearchBarProps = {
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({
  searchValue,
  onSearchChange,
  onFilterPress,
  placeholder = "Search",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <AppImage
          source={remotePlaceholders.search}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={palette.contentBody}
          value={searchValue}
          onChangeText={onSearchChange}
          showLabel={false}
          containerStyle={styles.textInputContainer}
          inputContainerStyle={styles.searchInputInnerContainer}
          editable={true}
        />
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
        activeOpacity={0.7}
      >
        <AppImage
          source={remotePlaceholders.filter}
          style={styles.filterIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: scale(8),
    height: verticalScale(40),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.lightGray,
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    gap: scale(8),
  },
  textInputContainer: {
    marginVertical: 0,
    flex: 1,
  },
  searchInputInnerContainer: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  searchIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    width: moderateScale(40),
    height: "100%",
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.lightGray,
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
});


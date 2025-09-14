//공용버튼
import React from "react";
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from "react-native";

//버튼이 받을때의 props 정의
interface CustomButtonProps {
    title: String;
    onPress: (event: GestureResponderEvent) => void;
};
 
const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress }) => {
  return (
    // TouchableOpacity는 터치 효과를 주는 가장 일반적인 버튼 컴포넌트입니다.
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};


// 여기에 앱 전체에서 사용할 공통 버튼 스타일을 정의합니다.
const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: '#007AFF', // 예시 색상 (파란색)
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 3, // 안드로이드 그림자 효과
  },
  buttonText: {
    color: '#FFFFFF', // 흰색 텍스트
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;
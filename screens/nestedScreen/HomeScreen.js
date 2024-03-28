import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView,ScrollView } from "react-native";
import { Feather } from '@expo/vector-icons';
import { authSignOutUser } from "../../redux/auth/authOperations";
import { getAllPosts } from "../../redux/posts/postsOperations";
import { LineChart } from 'react-native-chart-kit';
import { SelectList } from 'react-native-dropdown-select-list'
import { BarChart, PieChart} from 'react-native-chart-kit';

import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('test.db');

const HomeScreen = ({ navigation, route }) => {
    const { allItems: allPosts } = useSelector((state) => state.posts);
    const { userPhoto, email, nickname } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [gpaStatistics, setGpaStatistics] = useState(null); // Статистика GPA
    const [specialityCodesList, setSpecialityCodesList] = useState(null);
    const [selectedSpecialityCode, setSelectedSpecialityCode] = React.useState("");
    const [coursesList, setCoursesList] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [iinList, setIinList] = useState(null);
    const [selectedIin, setSelectedIin] = useState("");
    const [paymentFormList, setPaymentFormList] = useState(null);
    const [selectedPaymentForm, setSelectedPaymentForm] = useState("");
    const [chartData, setChartData] = useState({});
    const [educationLevelData, setEducationLevelData] = useState([]);

    useEffect(() => {
        dispatch(getAllPosts());
        getSemesterGpaStatistics(); // Получаем статистику при загрузке компонента
    }, []);

    const signOut = () => {
        dispatch(authSignOutUser());
    };
    const getAllSpecialtyCodes = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT DISTINCT specialty_code FROM Students',
                    [],
                    (_, result) => {
                        const { rows } = result;
                        const specialtyCodes = [];
                        for (let i = 1; i < rows.length; i++) {
                            specialtyCodes.push(rows.item(i).specialty_code);
                        }
                        resolve(specialtyCodes);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    };

    const getAllCourses = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT DISTINCT course FROM Students',
                    [],
                    (_, result) => {
                        const { rows } = result;
                        const courses = [];
                        for (let i = 1; i < rows.length; i++) {
                            courses.push(rows.item(i).course);
                        }
                        resolve(courses);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    };

    const getAllIINs = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT DISTINCT iin FROM Students',
                    [],
                    (_, result) => {
                        const { rows } = result;
                        const iins = [];
                        for (let i = 1; i < rows.length; i++) {
                            iins.push(rows.item(i).iin);
                        }
                        resolve(iins);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    };

    const getAllPaymentForms = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT DISTINCT payment_form FROM Students',
                    [],
                    (_, result) => {
                        const { rows } = result;
                        const paymentForms = [];
                        for (let i = 0; i < rows.length; i++) {
                            paymentForms.push(rows.item(i).payment_form);
                        }
                        resolve(paymentForms);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    };

    // getAllSpecialtyCodes()
    //     .then(specialtyCodes => {
    //         console.log('Список всех specialty_code:', specialtyCodes);
    //         setSpecialityCodesList(specialtyCodes);
    //     })
    //     .catch(error => {
    //         console.error('Ошибка при получении списка specialty_code:', error);
    //     });

    // const renderItem = ({ item }) => (
    //     <PublicPosts item={item} navigation={navigation} />
    // );

    const GeneralStatistics = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.userInfoContainer}>
                    <Image style={styles.avatar} source={{ uri: userPhoto }} />
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{nickname}</Text>
                        <Text style={styles.email}>{email}</Text>
                    </View>
                </View>
                {gpaStatistics && (
                    <View style={{borderBottomWidth: 1, borderBottomColor: '#E8E8E8', minHeight: 120}}>
                        <Text style={styles.generalStats.header}>Статистика по GPA:</Text>
                        <View style={styles.generalStats.container}>
                            <View style={styles.generalStats.column}>
                                <View style={styles.generalStats.item}>
                                    <Text style={styles.generalStats.text}>Количество</Text>
                                    <Text style={styles.generalStats.text}>{gpaStatistics.count}</Text>
                                </View>
                            </View>
                            <View style={styles.generalStats.column}>
                                <View style={styles.generalStats.item}>
                                    <Text style={styles.generalStats.text}>Среднее</Text>
                                    <Text style={styles.generalStats.text}>
                                        {gpaStatistics.average === null ? "1" : gpaStatistics.average.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.generalStats.column}>
                                <View style={styles.generalStats.item}>
                                    <Text style={styles.generalStats.text}>Макс</Text>
                                    <Text style={styles.generalStats.text}> {gpaStatistics.maxGpa}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

            </View>

        )
    }

    const getSemesterGpaStatistics = () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT COUNT(semester_gpa) AS count, AVG(semester_gpa) AS average, MAX(semester_gpa) AS maxGpa, MIN(semester_gpa) AS minGpa FROM Students',
                [],
                (_, result) => {
                    const { rows } = result;
                    if (rows.length > 0) {
                        const statistics = rows.item(0);
                        setGpaStatistics(statistics); // Обновляем состояние с полученной статистикой
                    } else {
                        console.log('Нет данных для вычисления статистики по semester_gpa');
                    }
                },
                error => {
                    console.error('Ошибка при выполнении запроса на получение статистики', error);
                }
            );
        });
    };
    const fetchGradesStatistics = async (course, specialty, discipline, language) => {
        try {
            // Формируем SQL-запрос на основе выбранных параметров
            let sqlQuery = 'SELECT AVG(total_score) AS averageScore, MAX(total_score) AS maxScore, MIN(total_score) AS minScore ';
            sqlQuery += 'FROM Students WHERE 1 = 1'; // Начальное условие

            // Добавляем условия выборки в SQL-запрос в зависимости от переданных параметров
            if (course) {
                sqlQuery += ` AND course = ${course}`;
            }
            if (specialty) {
                sqlQuery += ` AND specialty_code = '${specialty}'`;
            }
            if (discipline) {
                sqlQuery += ` AND discipline_code = '${discipline}'`;
            }
            if (language) {
                sqlQuery += ` AND language_of_study = '${language}'`;
            }

            // Выполняем SQL-запрос к базе данных
            const result = await new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        sqlQuery,
                        [],
                        (_, { rows }) => resolve(rows),
                        (_, error) => reject(error)
                    );
                });
            });

            // Проверяем, получены ли данные
            if (result.length > 0) {
                const statistics = result.item(0);
                return statistics;
            } else {
                console.log('Нет данных для статистики по предметам');
                return null;
            }
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
            // Обработка ошибки, например, вывод сообщения об ошибке на экран
            return null;
        }
    };
    const getIinCountByCourse = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT course, COUNT(DISTINCT iin) AS iin_count FROM Students GROUP BY course',
                    [],
                    (_, result) => {
                        const { rows } = result;
                        const iinCountByCourse = {};
                        for (let i = 0; i < rows.length-1; i++) {
                            iinCountByCourse[rows.item(i).course] = rows.item(i).iin_count;
                        }
                        resolve(iinCountByCourse);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    };
    const getEducationLevelStatistics = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT education_level, COUNT(*) AS count FROM Students GROUP BY education_level',
                    [],
                    (_, result) => {
                        const { rows } = result;
                        const educationLevelStatistics = [];
                        let totalCount = 0;
                        for (let i = 0; i < rows.length; i++) {
                            totalCount += rows.item(i).count;
                        }
                        for (let i = 1; i < rows.length; i++) {
                            const percentage = Math.round((rows.item(i).count / totalCount) * 100); // Используем Math.round() для округления
                            educationLevelStatistics.push({ label: rows.item(i).education_level, percentage });
                        }
                        resolve(educationLevelStatistics);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    };


    useEffect(()=>{
        getAllSpecialtyCodes()
        .then(specialtyCodes => {
            setSpecialityCodesList(specialtyCodes);
        })
        .catch(error => {
            console.error('Ошибка при получении списка specialty_code:', error);
        });

        getAllCourses()
            .then(courses => {
                setCoursesList(courses);
            })
            .catch(error => {
                console.error('Ошибка при получении списка курсов:', error);
            });

        getAllIINs()
            .then(iins => {
                setIinList(iins)
            })
            .catch(error => {
                console.error('Ошибка при получении списка IIN:', error);
            });

        getAllPaymentForms()
            .then(paymentForms => {
                setPaymentFormList(paymentForms)
            })
            .catch(error => {
                console.error('Ошибка при получении списка payment_form:', error);
            });

        getIinCountByCourse()
            .then(iinCountByCourse => {
                const courses = Object.keys(iinCountByCourse);
                const iinCounts = Object.values(iinCountByCourse);
                setChartData({ labels: courses, datasets: [{ data: iinCounts }] });
            })
            .catch(error => {
                console.error('Ошибка при получении статистики по IIN по курсу:', error);
            });

        getEducationLevelStatistics()
            .then(statistics => {
                setEducationLevelData(statistics);
            })
            .catch(error => {
                console.error('Ошибка при получении статистики по уровню образования:', error);
            });

    },[]);
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    return (
        <>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Статистика</Text>
                    <TouchableOpacity onPress={signOut}>
                        <Feather name="log-out" size={24} color="#BDBDBD" />
                    </TouchableOpacity>
                </View>
                <ScrollView>
                <GeneralStatistics />
                <View style={{flex: 1, flexDirection: 'column', rowGap: 20, padding: 30}}>
                    <View>
                        <Text style={{fontSize: 18, marginBottom: 10}}>Код специальности</Text>
                        <SelectList
                            setSelected={(val) => setSelectedSpecialityCode(val)}
                            data={specialityCodesList}
                            save="value"
                            placeholder="Все"
                            searchPlaceholder="Поиск"
                        />
                    </View>
                    <View>
                        <Text style={{fontSize: 18, marginBottom: 10}}>Курс</Text>
                        <SelectList
                            setSelected={(val) => setSelectedCourse(val)}
                            data={coursesList}
                            save="value"
                            placeholder="Курс"
                            search={false}
                        />
                    </View>
                    <View>
                        <Text style={{fontSize: 18, marginBottom: 10}}>ИИН студента</Text>
                        <SelectList
                            setSelected={(val) => setSelectedIin(val)}
                            data={iinList}
                            save="value"
                            placeholder="ИИН"
                            searchPlaceholder="Поиск по ИИН"
                        />
                    </View>
                    <View>
                        <Text style={{fontSize: 18, marginBottom: 10}}>Форма оплаты</Text>
                        <SelectList
                            setSelected={(val) => setSelectedPaymentForm(val)}
                            data={paymentFormList}
                            save="value"
                            placeholder="Форма оплаты"
                            search={false}
                        />
                    </View>
                    {chartData && chartData.labels && chartData.datasets && (
                        <View>
                        <Text style={{paddingBottom: 15, fontWeight: 600, textAlign: 'center', fontSize: 20}}>Студенты в разрезе по курсам обучения</Text>
                        <BarChart
                            data={chartData}
                            width={320}
                            height={220}
                            yAxisSuffix=""
                            yAxisLabel=""
                            chartConfig={
                                {
                                    backgroundGradientFrom: '#fff',
                                    backgroundGradientTo: '#fff',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 173, 230, ${opacity})`, // Цвет столбцов
                                    style: {
                                        borderRadius: 16,
                                    },
                                    barPercentage: 2.5, // Относительная ширина столбцов
                                    propsForVerticalLabels: {
                                        fontSize: 10,
                                    },
                                    propsForLabels: {
                                        fontSize: 10,
                                    },
                                    propsForBackgroundLines: {
                                        stroke: '#E8E8E8',
                                    },
                                    propsForDots: {
                                        r: '0',
                                        strokeWidth: '2',
                                        stroke: '#ffa726',
                                    },

                                }
                            }
                            verticalLabelRotation={30}
                            fromZero={true}
                        />
                        </View>
                    )}
                    {educationLevelData &&(
                        <View>
                        <Text style={{paddingBottom: 8, fontWeight: 600, textAlign: 'center',  fontSize: 20}}>Студенты в разрезе уровня обучения</Text>
                        <PieChart
                            data={educationLevelData.map(item => ({
                                name: item.label,
                                population: item.percentage,
                                color: getRandomColor(), // Функция для генерации случайного цвета
                                legendFontColor: '#7F7F7F',
                                legendFontSize: 13,
                            }))}
                            width={340}
                            height={220}
                            chartConfig={{
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                color: (opacity = 1) => `rgba(0, 173, 280, ${opacity})`, // Цвет текста
                            }}
                            accessor={"population"}
                            backgroundColor="transparent"
                            paddingLeft="6"
                            absolute
                        />
                        </View>

                    )}
                </View>
                </ScrollView>
                {/*<FlatList*/}
                {/*    data={allPosts}*/}
                {/*    renderItem={renderItem}*/}
                {/*    keyExtractor={(item) => item.id}*/}
                {/*    showsVerticalScrollIndicator={false}*/}
                {/*/>*/}
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    headerTitle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 20,
        lineHeight: 24,
        color: '#212121',
    },
    headerRightIcon: {
        paddingHorizontal: 16,
    },
    headerRightIconText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        lineHeight: 19,
        color: '#BDBDBD',
    },
    headerContainer: {
        paddingTop: 10,
        // paddingHorizontal: 16

    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        width: '100%',
    },
    avatar: {
        width: 50,
        height: 50,
        marginLeft: 20,
        borderRadius: 25,
        backgroundColor: '#BDBDBD',
    },
    userInfo: {
        marginLeft: 12,
    },
    username: {
        fontFamily: 'Roboto-Medium',
        fontSize: 16,
        lineHeight: 19,
        color: '#212121',
    },
    email: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        color: '#757575',
    },
    separator: {
        height: 1,
        backgroundColor: '#E8E8E8',
        marginBottom: 20,
    },
    statisticsText: {
        fontFamily: 'Roboto-Medium',
        fontSize: 16,
        lineHeight: 19,
        color: '#212121',
        marginBottom: 10,
    },
    generalStats: {
        header: {
            fontSize: 22,
            lineHeight: 26,
            textAlign: 'center',
            marginBottom: 10
        },
        container: {
            flex: 1,
            flexDirection: 'row', // Располагаем колонки в ряд
            padding: 5
        },
        column: {
            flex: 1, // Распределение пространства между колонками
            alignItems: 'center', // Выравнивание по центру по горизонтали
            height: '100%'
        },
        item: {
            width: '90%', // Ширина элемента
            marginVertical: 10, // Вертикальный отступ между элементами
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            height: 50,
            borderRadius: 14
        },
        text: {
        },
    }

});

export default HomeScreen;

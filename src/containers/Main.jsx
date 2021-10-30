import { Line } from '@ant-design/charts';
import { LineChartOutlined } from "@ant-design/icons";
import { message, Modal, Table } from 'antd';
import axios from 'axios';
import { useEffect, useState } from "react";
import SelectController from "../components/SelectController";
import { calcAverage } from '../utils/average';
import { numRound } from '../utils/round';
import { formatTimestamp } from "../utils/time";


const backendUrl = process.env.BACKEND_URL ||'http://localhost:4500';


function formatCrypto( rawData, format = 'Y-m-d H:i:s' ){

    let prices = [];

    let metrics = [];

    for (let i = (rawData.data.length - 1); i > (rawData.data.length - 50); i-- ){
        prices.push( +rawData.data[i][1] );
        metrics.unshift({
            timestamp: formatTimestamp(rawData.data[i][0], format), 
            price: +rawData.data[i][1]
        });
    }

    return { 
        metrics, 
        average: numRound(calcAverage(prices))
    }
}

export default function Main(){

    const [cryptos, setCryptos] = useState([]);
    const [selectedCryptos, setSelectedCryptos] = useState([]);
    const [availableCryptosList, setAvailableCryptosList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect( () => {

        (async () => {

            //TODO build axios with promise all to get info from database
            // const infoFromDataBase = [
            //     {
            //         // position: 1,
            //         name: "Bitcoin",
            //         averages: {
            //             minute: 1,
            //             hour: 2,
            //             day: 3
            //         },
            //         metrics: {
            //             minute: [{ timestamp: 1635365081, price: 3},{ timestamp: 1635365090, price: 4},].map( _metric => { 
            //                 return { 
            //                     timestamp: formatTimestamp(_metric.timestamp),
            //                     price: _metric.price
            //                 }
            //             }),
            //             hour: [{ timestamp: 1635365081, price: 3},{ timestamp: 1635365090, price: 4},].map( _metric => { 
            //                 return { 
            //                     timestamp: formatTimestamp(_metric.timestamp),
            //                     price: _metric.price
            //                 }
            //             }),
            //             day:[{ timestamp: 1635365081, price: 3},{ timestamp: 1635365090, price: 4},].map( _metric => { 
            //                 return { 
            //                     timestamp: formatTimestamp(_metric.timestamp),
            //                     price: _metric.price
            //                 }
            //             })
            //         }
            //     },
            //     {
            //         // position: 2,
            //         name: "Etherium",
            //         averages: {
            //             minute: 2,
            //             hour: 3,
            //             day: 4
            //         },
            //         metrics: {
            //             minute: [{ timestamp: 1635365081, price: 2},{ timestamp: 1635365090, price: 4},].map( _metric => { 
            //                 return { 
            //                     timestamp: formatTimestamp(_metric.timestamp),
            //                     price: _metric.price
            //                 }
            //             }),
            //             hour: [{ timestamp: 1635365081, price: 2},{ timestamp: 1635365090, price: 4},].map( _metric => { 
            //                 return { 
            //                     timestamp: formatTimestamp(_metric.timestamp),
            //                     price: _metric.price
            //                 }
            //             }),
            //             day:[{ timestamp: 1635365081, price: 2},{ timestamp: 1635365090, price: 4},].map( _metric => { 
            //                 return { 
            //                     timestamp: formatTimestamp(_metric.timestamp),
            //                     price: _metric.price
            //                 }
            //             })
            //         }
            //     },
            // ];
            const _availableCryptosList = [
                {
                    id: "XDG",
                    currency:"EUR",
                    name: "Dogecoin",
                },
                {
                    id: "BTC",
                    currency:"EUR",
                    name: "Bitcoin"
                },
                {
                    id: "ETH",
                    currency:"EUR",
                    name: "Etherium"
                },
                {
                    id: "ADA",
                    currency:"EUR",
                    name: "Cardano"
                },
                {
                    id: "DOT",
                    currency:"EUR",
                    name: "Polkadot"
                },
                {
                    id: "XRP",
                    currency:"EUR",
                    name: "Ripple"
                },
            
            ];

            // setCryptos(infoFromDataBase);
            setAvailableCryptosList(_availableCryptosList)

        })();

    }, []);

    useEffect( () => {
        const list = availableCryptosList.filter( _cryptos => selectedCryptos.find(_selected => _selected === _cryptos.id) );

        if ( list.length > 0 ){
            setLoading(true);

            (async () => {

                let newCryptos = [];
                for await(const _crypto of list) {

                    const promises = await Promise.all([
                        axios.get(`${backendUrl}/metrics?cryptoId=${_crypto.id}&interval=${1}`),
                        axios.get(`${backendUrl}/metrics?cryptoId=${_crypto.id}&interval=${60}`),
                        axios.get(`${backendUrl}/metrics?cryptoId=${_crypto.id}&interval=${1440}`),
                    ])

                    if ( ! promises ) message.error('Error loading metrics!');

                    const [
                        { data: intervalsPerMinute },
                        { data: intervalsPerHour },
                        { data: intervalsPerDay },
                    ] = promises;

                    const minutes = formatCrypto(intervalsPerMinute, 'm-d H:i');
                    const hour = formatCrypto(intervalsPerHour, 'm-d H');
                    const day = formatCrypto(intervalsPerDay, 'Y-m-d');
    
                    newCryptos.push({
                        ..._crypto,
                        averages: {
                            day: day.average,
                            hour: hour.average,
                            minute: minutes.average,
                        },
                        metrics: {
                            day: day.metrics,
                            hour: hour.metrics,
                            minute: minutes.metrics,
                        },
                    });
                }

                setCryptos(newCryptos);
                setLoading(false);
            })();

        }


    }, [selectedCryptos, availableCryptosList]);

    const Header = ()=> (
        <div className="cnt-2 bgc-theme"> 
            <p className="fnt-3">Artur Vardanyan's Crypto Visualization</p>
        </div>
    )


    const Content = ()=> {
        
        const [modalInfo, setModalInfo] = useState(null);
        
        const ExtraInfo = () => {
            
            const [selectedMetric, setSelectedMetric] = useState('day');

            const graphConfig = {
                data: modalInfo && modalInfo?.metrics[selectedMetric] || [],
                height: 250,
                xField: 'timestamp',
                yField: 'price',
                point: {
                    size: 5,
                    shape: 'diamond',
                },
            };

            const AverageInfo = ({time = "day"}) => {
                return (
                    <div 
                        onClick={()=>{
                            setSelectedMetric(time.toLowerCase());
                        }}
                        className={`
                            pointer 
                            padding-1 
                            paddingR-2 
                            paddingL-2 
                            ${selectedMetric === time.toLowerCase() && 'bgc-lgrey'}
                        `}
                    >
                        <p>{time}</p>
                        <p>{modalInfo.averages?.[time.toLowerCase()]}</p>
                    </div>
                )
            }

            return (<>
                <Modal
                    width={700}
                    title={`${modalInfo && modalInfo.name} Graph`}
                    visible={modalInfo}
                    onCancel={()=>{
                        setModalInfo(false)
                    }}
                    footer={null}
                    destroyOnClose
                >
                    { modalInfo &&(<>
                        <span className="flex fnt-center">
                            <div className="flex fjss w38">
                                {/* <div className="marginL-2">
                                    <h4>Position</h4>
                                    <p>{modalInfo.position}</p>
                                </div> */}
                            </div>
                            <div>
                                <h4>Averages per last</h4>
                                <div className="flex">
                                    <AverageInfo time="Minute"/>
                                    <AverageInfo time="Hour"/>
                                    <AverageInfo time="Day"/>
                                </div>
                            </div>
                        </span>
                        <span className="w80">
                            <Line {...graphConfig} />
                        </span>
                        
                    </>)
                    }

                </Modal>
            </>);
        }
    
        const columns = [
            // {
            //     key:'position',
            //     title:'Position',
            //     dataIndex:'position'
            // },
            {
                key:'name',
                title:'Name',
                dataIndex:'name'
            },
            {
                key:'avgMin',
                title:'Minutes (avg)',
                dataIndex:'averages',
                render: (averages)=> <span className="fnt-center">{averages.minute}</span>
            },
            {
                key:'avgHour',
                title:'Hours (avg)',
                dataIndex:'averages',
                render: (averages)=> <span className="fnt-center">{averages.hour}</span>
            },
            {
                key:'avgDay',
                title:'days (avg)',
                dataIndex:'averages',
                render: (averages)=> <span className="fnt-center">{averages.day}</span>
            },
            {
                key:'actions',
                title:'Actions',
                render: ( _data ) => {
                    return <LineChartOutlined 
                        onClick={ () => setModalInfo(_data)}
                    />
                }
            },
    
        ];

        return (
            <div className="padding-2 bgc-purple flex-row-center flex-col-center">
                <ExtraInfo/>
                <div className="flex-col w100 paddingB-3">
                    <span className="fjcc w100">
                        <SelectController
                            selected = { selectedCryptos }
                            optionsList = { availableCryptosList }
                            onChange = { value => setSelectedCryptos(value)}
                            selectOptions = {{
                                mode: "multiple",
                                className: "w40",
                                // allowClear: true,
                            }}
                        />
                    </span>
                    <span className="fjcc w100">
                        <p className="fnt-2">Select the cryptos to visualize</p>
                    </span>
                </div>

                <Table 
                    loading={loading}
                    className="fnt-center"
                    rowKey={ _x => _x.name}
                    columns={ columns } 
                    dataSource={cryptos} 
                    pagination={{
                        total:( cryptos.length ),
                        pageSizeOptions: [10, 20, 50, 100],
                        defaultPageSize: 100,
                        showSizeChanger: true,
                        hideOnSinglePage: false,
                    }} 
                />
            </div>
        )
    }

    return (
        <div className="body bgc-theme">

            <Header/>
            <Content/>
            
        </div>
    )

}
import { Line } from '@ant-design/charts';
import { Button, message, Modal, Table } from 'antd';
import Header from './Header';
import axios from 'axios';
import { useEffect, useState } from "react";
import SelectController from "../components/SelectController";
import { calcAverage } from '../utils/average';
import { numRound } from '../utils/round';
import { formatTimestamp } from "../utils/time";

const backendUrl = process.env.BACKEND_URL ||'http://localhost:4500';

function formatCrypto({
    rawData, 
    format = 'Y-m-d H:i:s', 
    metricLength = 60 
}){

    let prices = [];

    let metrics = [];

    for (let i = (rawData.data.length - 1); i > (rawData.data.length - metricLength); i-- ){
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

async function saveMetrics(metrics){

    const { data: send } = await axios.post(`${backendUrl}/metrics`,{metrics});

    if ( ! send.error ) message.success('Metrics saved correctly!')
    else message.error( send.message );
}

export default function Main(){

    const [cryptos, setCryptos] = useState([]);
    const [selectedCryptos, setSelectedCryptos] = useState([]);
    const [availableCryptosList, setAvailableCryptosList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updater, setUpdater] = useState(0);
    const [savedMetrics, setSavedMetrics] = useState([]);

    useEffect( () => {

        (async () => {

            const { data: { data: _availableCryptosList } } = await axios.get(`${backendUrl}/cryptos`);
            if (_availableCryptosList) setAvailableCryptosList(_availableCryptosList)
            else message.error('Something went Wrong!')
            
            const { data: { data: metrics } } = await axios.get(`${backendUrl}/metrics`);
            if ( metrics ) setSavedMetrics(metrics);
            else message.error('Something went Wrong!')
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
                        axios.get(`${backendUrl}/newMetrics?cryptoId=${_crypto.id}&interval=${1}`),
                        axios.get(`${backendUrl}/newMetrics?cryptoId=${_crypto.id}&interval=${60}`),
                        axios.get(`${backendUrl}/newMetrics?cryptoId=${_crypto.id}&interval=${1440}`),
                        axios.get(`${backendUrl}/metrics`)
                    ])

                    if ( ! promises ) message.error('Error loading metrics!');

                    const [
                        { data: intervalsPerMinute },
                        { data: intervalsPerHour },
                        { data: intervalsPerDay },
                        { data: { data: metrics } },
                    ] = promises;

                    if ( metrics ) setSavedMetrics(metrics);

                    const minutes = formatCrypto({
                        rawData: intervalsPerMinute,
                        format: 'm-d H:i',
                        metricLength: 60
                    });
                    const hour = formatCrypto({
                        rawData: intervalsPerHour,
                        format: 'H:i',
                        metricLength: 24
                    });
                    const day = formatCrypto({
                        rawData: intervalsPerDay,
                        format: 'Y-m-d',
                        metricLength: 30
                    });
                    // const hour = formatCrypto(intervalsPerHour, 'H:i', 24);
                    // const day = formatCrypto(intervalsPerDay, 'Y-m-d', 30);
    
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

    }, [selectedCryptos, availableCryptosList, updater]);

    function Content() {
        
        const [modalCrypto, setModalCrypto] = useState(null);
        const [modalMetric, setModalMetric] = useState(null);

        useEffect( () => {
            
            const _metricMatch = savedMetrics.find( _metric => modalCrypto && modalCrypto.id === _metric.id );
            if (_metricMatch) setModalMetric(_metricMatch)

        }, [modalCrypto]);

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
                render: (averages, crypto)=> {
                    const metric = savedMetrics.find( _metric => crypto.id === _metric.id );
                    return <>
                        {metric && <span 
                            className={`
                                fnt-center 
                                ${metric.averages.minute >= averages.minute
                                    ? 'clr-green'
                                    : 'clr-red'
                                }`
                            }
                        >
                            {metric.averages.minute >= averages.minute
                                ? '⬆'
                                : '⬇'
                            }
                            {/* {metric.averages.minute} */}
                        </span>}
                        <span className="fnt-center"> {averages.minute}</span>
                    </>
                }
            },
            {
                key:'avgHour',
                title:'Hours (avg)',
                dataIndex:'averages',
                render: (averages, crypto)=> {
                    const metric = savedMetrics.find( _metric => crypto.id === _metric.id );
                    return <>
                        {metric && <span 
                            className={`
                                fnt-center 
                                ${metric.averages.hour >= averages.hour
                                    ? 'clr-green'
                                    : 'clr-red'
                                }`
                            }
                        >
                            {metric.averages.hour >= averages.hour
                                ? '⬆'
                                : '⬇'
                            }
                            {/* {metric.averages.hour} */}
                        </span>}
                        <span className="fnt-center"> {averages.hour}</span>
                    </>
                }
            },
            {
                key:'avgDay',
                title:'days (avg)',
                dataIndex:'averages',
                render: (averages, crypto)=> {
                    const metric = savedMetrics.find( _metric => crypto.id === _metric.id );
                    return <>
                        {metric && <span 
                            className={`
                                fnt-center 
                                ${metric.averages.day >= averages.day
                                    ? 'clr-green'
                                    : 'clr-red'
                                }`
                            }
                        >
                            {metric.averages.day >= averages.day
                                ? '⬆'
                                : '⬇'
                            }
                            {/* {metric.averages.day} */}
                        </span>}
                        <span className="fnt-center"> {averages.day}</span>
                    </>
                }
            },
            {
                key:'actions',
                title:'Actions',
                render: ( _data ) => (
                    <Button
                        type="primary"
                        onClick={ () => setModalCrypto(_data)}
                    > 
                    Metrics 📈
                    </Button>
                )   
            },
        ];
        
        const ModalExtraInfo = () => {
            
            const [selectedMetric, setSelectedMetric] = useState('day');

            const graphConfig = {
                data: (modalCrypto && modalCrypto?.metrics[selectedMetric]) || [],
                height: 250,
                xField: 'timestamp',
                yField: 'price',
                point: {
                    size: 5,
                    shape: 'diamond',
                },
            };

            const AverageInfo = ({time = "day"}) => {
                const _time = time.toLowerCase();
                return (
                    <div 
                        onClick={()=>{
                            setSelectedMetric(_time);
                        }}
                        className={`
                            container
                            pointer 
                            padding-1 
                            paddingR-2 
                            paddingL-2 
                            ${selectedMetric === _time && 'bgc-lgrey'}
                        `}
                    >
                        <p>{time}</p>
                        <p>
                            {modalMetric && <span 
                                className={`marginR-1
                                    ${modalMetric.averages[_time] <= modalCrypto.averages?.[_time]
                                        ? 'clr-green'
                                        : 'clr-red'
                                    }
                                `}
                            >
                                {modalMetric.averages[_time]}
                            </span>}
                            {modalCrypto.averages?.[_time]}
                        </p>
                    </div>
                )
            }

            return (<>
                <Modal
                    width={700}
                    title={`${modalCrypto && modalCrypto.name} Graph`}
                    visible={modalCrypto}
                    onCancel={()=>{
                        setModalCrypto(false)
                    }}
                    footer={null}
                    destroyOnClose
                >
                    { modalCrypto &&(<>
                        <span className="flex fnt-center">
                            <div className="flex fjss w38">
                                {modalMetric &&
                                    <div className="marginL-2">
                                        <h4>Last save</h4>
                                        <p>{ formatTimestamp(modalMetric.timestamp)}</p>
                                    </div>
                                }
                                
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
        
        function CryptosSelector(){
            return (
                <div className="flex-col w100">
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
                        <p className="fnt-2 clr-white">Select the cryptos to visualize</p>
                    </span>
                </div>
            );
        }

        function LoadAndSave(){
            return (
                <div className="fjcc w30">
                    <Button 
                        type="primary"
                        className="marginB-3 marginR-2"
                        disabled={ loading || ! cryptos.length }
                        onClick={ _ev => setUpdater( updater + 1) }
                    >
                        Reload 🔁
                    </Button>
                    <Button 
                        type="primary"
                        className="marginB-3"
                        disabled={ loading || ! cryptos.length }
                        onClick={ _ev => {
                            saveMetrics( cryptos );
                            setUpdater( updater + 1 );
                        }}
                    >
                        Save ⏺
                    </Button>
                </div>
            )
        }

        return (
            <div className="padding-2 bgc-purple flex-row-center flex-col-center">
                <ModalExtraInfo/>
                
                <CryptosSelector/>

                <LoadAndSave/>

                <Table 
                    loading={loading}
                    className="container fnt-center"
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
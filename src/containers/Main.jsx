import { LineChartOutlined } from "@ant-design/icons";
import { Line } from '@ant-design/charts';
import { Modal, Table } from 'antd';
import { useEffect, useMemo, useState } from "react";
import { formatTimestamp } from "../utils/time";
import SelectController from "../components/SelectController";

export default function Main(){

    const [cryptos, setCryptos] = useState([]);
    const [selectedCryptos, setSelectedCryptos] = useState([]);

    const availableCryptosList = useMemo( ()=>{
        return [
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
        
        ]
    })

    useEffect( async () => {

        //TODO: GET cryptos from database
        const infoFromDataBase = [
            {
                position: 1,
                name: "Bitcoin",
                averages: {
                    minute: 1,
                    hour: 2,
                    day: 3
                },
                metrics: [
                    { timestamp: 1635365081, price: 1},
                    { timestamp: 1635365082, price: 3},
                    { timestamp: 1635365083, price: 2},
                    { timestamp: 1635365084, price: 4},
                    { timestamp: 1635365085, price: 5},
                    { timestamp: 1635365086, price: 4},
                    { timestamp: 1635365087, price: 7},
                    { timestamp: 1635365088, price: 6},
                    { timestamp: 1635365089, price: 9},
                ].map( _metric => { 
                    return { 
                        timestamp: formatTimestamp(_metric.timestamp),
                        price: _metric.price
                    }
                })
            },
            {
                position: 2,
                name: "Etherium",
                averages: {
                    minute: 2,
                    hour: 3,
                    day: 4
                },
                metrics: [
                    { timestamp: 1635365081, price: 4},
                    { timestamp: 1635365082, price: 2},
                    { timestamp: 1635365083, price: 2},
                    { timestamp: 1635365084, price: 4},
                    { timestamp: 1635365085, price: 3},
                    { timestamp: 1635365086, price: 6},
                    { timestamp: 1635365087, price: 7},
                    { timestamp: 1635365088, price: 9},
                    { timestamp: 1635365089, price: 8},
                ].map( _metric => { 
                    return { 
                        timestamp: formatTimestamp(_metric.timestamp),
                        price: _metric.price
                    }
                })
            },
        ];

        setCryptos(infoFromDataBase);
        
    }, []);

    useEffect( () => {
        
        console.log( "selectedCryptos", `(${typeof selectedCryptos}): `, selectedCryptos);
    }, [selectedCryptos]);

    const Header = ()=> (
        <div className="cnt-2 bgc-theme"> 
            <p className="fnt-3">Artur Vardanyan's Crypto Visualization</p>
        </div>
    )


    const Content = ()=> {
        
        const [modalInfo, setModalInfo] = useState(null);
        
        const graphConfig = {
            data: modalInfo?.metrics,
            height: 250,
            xField: 'timestamp',
            yField: 'price',
            point: {
                size: 5,
                shape: 'diamond',
            },
        };

        const ExtraInfo = () => (<>
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
                            <div className="marginL-2">
                                <h4>Position</h4>
                                <p>{modalInfo.position}</p>
                            </div>
                        </div>
                        <div>
                            <h4>Averages per last</h4>
                            <div className="flex">
                                <div className="padding-1">
                                    <p>Minute</p>
                                    <p>{modalInfo.averages.minute}</p>
                                </div>
                                <div className="padding-1">
                                    <p>Hour</p>
                                    <p>{modalInfo.averages.hour}</p>
                                </div>
                                <div className="padding-1">
                                    <p>Day</p>
                                    <p>{modalInfo.averages.day}</p>
                                </div>
                            </div>
                        </div>
                    </span>
                    <span className="w80">
                        <Line {...graphConfig} />
                    </span>
                    
                </>)
                }

            </Modal>
        </>)
    
        const columns = [
            {
                key:'position',
                title:'Position',
                dataIndex:'position'
            },
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
                        onClick={ ()=>{
                            setModalInfo(_data);
                            // console.log( "_data", `(${typeof _data}): `, _data);
                        }}
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
                                allowClear: true,
                            }}
                        />
                    </span>
                    <span className="fjcc w100">
                        <p className="fnt-2">Select the cryptos to visualize</p>
                    </span>
                </div>

                <Table 
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
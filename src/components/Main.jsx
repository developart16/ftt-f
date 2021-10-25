import {Table} from 'antd'

export default function Main(){

    const dataExample = [{
        _idx:1,
        name:"Bitcoin",
        averages: {
            minute:1,
            hour:2,
            day:3
        }
    }]

    const columns = [
        {
            key:'position',
            title:'Position',
            dataIndex:'_idx'
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
    ]

    return (
        <div className="body bgc-theme">
            <div className="cnt-2 bgc-theme"> 
                <p className="fnt-3">Artur Vardanyan's Crypto Visualization</p>
            </div>
            
            <div className="padding-2 bgc-red flex-row-center flex-col-center"> 
                <div>
                    <Table 
                        className="fnt-center" 
                        columns={ columns } 
                        dataSource={dataExample} 
                        pagination={{
                            total:(dataExample !== null ?dataExample?.length:0 ),
                            pageSizeOptions: [10, 20, 50, 100],
                            defaultPageSize: 100,
                            showSizeChanger: true,
                            hideOnSinglePage: false,
                        }} 
                    />
                </div>
            </div>
        </div>
    )

}
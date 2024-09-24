"use client";
import { TrendingUp } from "lucide-react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { useEffect, useState } from "react";
export const description = "A linear line chart";
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;
export function Chart() {
  const [liveData, setLiveData] = useState<any>([]);
  const [chartData, setChartData] = useState<any>([]);
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(
    "wss://wspap.okx.com:8443/ws/v5/public",
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    if (ReadyState.OPEN) {
      sendJsonMessage({
        op: "subscribe",
        args: [
          {
            channel: "tickers",
            instId: "BTC-USD-SWAP",
          },
        ],
      });
    }
  }, []);

  useEffect(() => {
    if (lastMessage) {
      let data = JSON.parse(lastMessage.data);
      setLiveData(data);
      const newPrice = data && data?.data && data?.data[0]?.last;
      if (newPrice) {
        setChartData((prevData: any) => {
          const newData = {
            time: new Date().toLocaleTimeString(),
            Price: parseFloat(newPrice),
            yaxisPrice: parseFloat(newPrice),
          };
          return [...prevData, newData];
        });
      }
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bitcoin.live (BTC-USD)</CardTitle>
        <CardDescription className="flex items-center gap-1">
          Highest: {liveData && liveData?.data ? liveData?.data[0]?.high24h : 0}
          $ <TrendingUp className="h-4 w-4" />
        </CardDescription>
        <CardDescription>
          Websocket Status: <b>{connectionStatus}</b>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={true} />
            <YAxis
              dataKey="yaxisPrice"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={["dataMin", "dataMax"]}
            />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="Price"
              type="linear"
              stroke="green"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing the live data each sec.
        </div>
        <div className="leading-none text-muted-foreground">
          <b>SOURCE:</b> https://www.okx.com/
        </div>
      </CardFooter>
    </Card>
  );
}

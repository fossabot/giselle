import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FC } from "react";
import { AgentList } from "./agent-list";

export const Finder: FC = () => {
	return (
		<DropdownMenu defaultOpen={true} modal={false}>
			<DropdownMenuTrigger />
			<DropdownMenuContent>
				{/**<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Agent</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<AgentList onSelect={onSelect} />
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
					</DropdownMenuGroup>
				<DropdownMenuSeparator /> **/}
				<DropdownMenuGroup>
					<DropdownMenuLabel>CREATE TEST NODE</DropdownMenuLabel>
					<DropdownMenuItem
						onSelect={() => {
							console.log("select!!");
						}}
					>
						On Request
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
